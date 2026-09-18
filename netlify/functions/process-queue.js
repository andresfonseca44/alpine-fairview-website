// ==========================================================================
// SCHEDULED FUNCTION: Flush queued leads
// Runs once daily (see netlify.toml schedule) shortly after midnight
// Eastern. For each agent, pulls leads held while their daily cap/order
// balance was exhausted and sends as many as today's fresh capacity allows
// (oldest first). Anything left over stays queued for the next run.
//
// Can also be triggered manually via GET for testing:
//   https://alpinefairview.com/.netlify/functions/process-queue
// ==========================================================================

const { connectLambda } = require('@netlify/blobs');
const {
  loadConfig,
  saveConfig,
  todayEastern,
  getDailyCount,
  getQueue,
  setQueue,
  credentialsFor
} = require('./lib/lead-routing');

// incrementDailyCount/decrementBalance are internal to routeLead() and not
// exported, so this file bumps the same Blobs key directly (same key
// format, so it stays consistent with what routeLead() reads).
const { getStore } = require('@netlify/blobs');

async function bumpDailyCount(agentId, dateKey) {
  const s = getStore({ name: 'lead-routing', consistency: 'strong' });
  const key = `daily:${agentId}:${dateKey}`;
  const current = (await s.get(key, { type: 'json' })) || 0;
  await s.setJSON(key, current + 1);
  return current + 1;
}

async function postToDigitalBGA(payload) {
  const formBody = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formBody.append(key, value);
    }
  });

  const apiResponse = await fetch('https://api.crm.digitalseniorbenefits.com/inbound-lead/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString()
  });

  const responseText = await apiResponse.text();
  let responseData;
  try { responseData = JSON.parse(responseText); } catch (e) { responseData = { message: responseText }; }
  return { status: apiResponse.status, responseData };
}

exports.handler = async (event) => {
  if (event) connectLambda(event); // required for Netlify Blobs in Lambda-compatibility mode
  const headers = { 'Content-Type': 'application/json' };
  const results = [];

  try {
    const config = await loadConfig();
    const dateKey = todayEastern();

    for (const agent of config.agents) {
      if (agent.isDefault) continue; // default agent has no queue

      const queue = await getQueue(agent.id);
      if (queue.length === 0) continue;

      const remaining = [];
      let sent = 0;

      for (const record of queue) {
        const dailyCount = await getDailyCount(agent.id, dateKey);
        const hasDailyCapacity = agent.dailyCap == null || (dailyCount + sent) < agent.dailyCap;
        const hasBalance = agent.balance == null || agent.balance > 0;

        if (!hasDailyCapacity || !hasBalance) {
          remaining.push(record); // still capped/exhausted — stays queued
          continue;
        }

        const { apiUser, apiKey } = credentialsFor(agent);
        const payload = { ...record.payload, api_user: apiUser, api_key: apiKey };

        try {
          const { status, responseData } = await postToDigitalBGA(payload);
          console.log(`📤 [QUEUE FLUSH] Sent queued lead for ${agent.name} [${status}]:`, responseData);

          await bumpDailyCount(agent.id, dateKey);
          if (typeof agent.balance === 'number') {
            agent.balance = Math.max(0, agent.balance - 1);
          }
          sent++;
        } catch (err) {
          console.error(`❌ [QUEUE FLUSH] Failed to send queued lead for ${agent.name}:`, err.message || err);
          remaining.push(record); // retry next run
        }
      }

      await setQueue(agent.id, remaining);
      results.push({ agentId: agent.id, agentName: agent.name, sent, stillQueued: remaining.length });
    }

    await saveConfig(config); // persist any balance decrements from this run

    console.log('✅ [QUEUE FLUSH] Complete:', results);

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', results }) };
  } catch (err) {
    console.error('❌ [QUEUE FLUSH] Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ status: 'error', error: err.message || String(err) }) };
  }
};
