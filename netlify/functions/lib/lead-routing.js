// ==========================================================================
// SHARED LEAD ROUTING ENGINE
// Decides which agent's DigitalBGA account a given lead should be posted
// to, based on state licensing, daily send caps, and remaining order
// balance. State is persisted in Netlify Blobs so it survives across
// function invocations (functions themselves are stateless).
//
// The agent config is editable at runtime via the admin page/API
// (admin-agents.js) — DEFAULT_CONFIG below is only used to seed the store
// the very first time it's read. After that, Blobs is the source of truth.
// ==========================================================================

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'lead-routing';
const CONFIG_KEY = 'agents-config';

const DEFAULT_CONFIG = {
  agents: [
    {
      id: 'andres',
      name: 'Andres Fonseca',
      active: true,
      isDefault: true, // permanent catch-all — no daily cap, no balance limit
      priority: 99,     // tried last
      states: [
        'AL', 'CA', 'FL', 'GA', 'LA', 'MD', 'MI', 'MO', 'MS', 'NC', 'OK',
        'SC', 'TN', 'TX', 'WV', 'KY', 'NV', 'AZ', 'NH', 'MN', 'NJ', 'WA'
      ],
      dailyCap: null,
      balance: null,
      apiUserEnv: 'DIGITALBGA_API_USER',
      apiKeyEnv: 'DIGITALBGA_API_KEY'
    },
    {
      id: 'james',
      name: 'James',
      active: true,
      isDefault: false,
      priority: 1, // tried first wherever he's licensed
      states: [
        'LA', 'MI', 'TX', 'TN', 'OH', 'PA', 'SC', 'MO', 'AZ', 'OR', 'IN',
        'VA', 'CO', 'NV', 'WA', 'NE', 'AR', 'NC', 'OK', 'WI', 'MS', 'AL'
      ],
      dailyCap: 13,
      balance: 100,
      apiUserEnv: 'JAMES_DBGA_API_USER',
      apiKeyEnv: 'JAMES_DBGA_API_KEY'
    }
  ]
};

function getStateAbbrev(rawState) {
  if (!rawState) return null;
  return String(rawState).trim().toUpperCase().slice(0, 2);
}

// "Today" in America/New_York as YYYY-MM-DD. This is what makes daily caps
// reset at midnight Eastern regardless of what timezone the server runs in,
// and regardless of Daylight Saving.
function todayEastern() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

function store() {
  return getStore(STORE_NAME);
}

async function loadConfig() {
  const s = store();
  const existing = await s.get(CONFIG_KEY, { type: 'json' });
  if (existing) return existing;
  await s.setJSON(CONFIG_KEY, DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

async function saveConfig(config) {
  await store().setJSON(CONFIG_KEY, config);
  return config;
}

async function getDailyCount(agentId, dateKey) {
  const val = await store().get(`daily:${agentId}:${dateKey}`, { type: 'json' });
  return val || 0;
}

async function incrementDailyCount(agentId, dateKey) {
  const s = store();
  const key = `daily:${agentId}:${dateKey}`;
  const current = (await s.get(key, { type: 'json' })) || 0;
  await s.setJSON(key, current + 1);
  return current + 1;
}

async function setDailyCount(agentId, dateKey, count) {
  await store().setJSON(`daily:${agentId}:${dateKey}`, Number(count));
  return Number(count);
}

async function decrementBalance(config, agentId) {
  const agent = config.agents.find(a => a.id === agentId);
  if (agent && typeof agent.balance === 'number') {
    agent.balance = Math.max(0, agent.balance - 1);
    await saveConfig(config);
  }
}

async function getQueue(agentId) {
  const val = await store().get(`queue:${agentId}`, { type: 'json' });
  return val || [];
}

async function pushToQueue(agentId, leadRecord) {
  const s = store();
  const key = `queue:${agentId}`;
  const current = (await s.get(key, { type: 'json' })) || [];
  current.push(leadRecord);
  await s.setJSON(key, current);
}

async function setQueue(agentId, records) {
  await store().setJSON(`queue:${agentId}`, records);
}

function credentialsFor(agent) {
  return {
    apiUser: (process.env[agent.apiUserEnv] || '').trim(),
    apiKey: (process.env[agent.apiKeyEnv] || '').trim()
  };
}

// Core routing decision for a brand-new inbound lead.
// Returns one of:
//   { outcome: 'routed', agentId, agentName, apiUser, apiKey }
//   { outcome: 'queued', queuedFor, agentName }
//   { outcome: 'unlicensed' }
async function routeLead(rawState) {
  const config = await loadConfig();
  const stateAbbrev = getStateAbbrev(rawState);
  const dateKey = todayEastern();

  const candidates = config.agents
    .filter(a => a.active && stateAbbrev && a.states.includes(stateAbbrev))
    .sort((a, b) => a.priority - b.priority);

  for (const agent of candidates) {
    if (agent.isDefault) {
      await incrementDailyCount(agent.id, dateKey); // for reporting only — default agent has no cap
      const { apiUser, apiKey } = credentialsFor(agent);
      return { outcome: 'routed', agentId: agent.id, agentName: agent.name, apiUser, apiKey };
    }

    const dailyCount = await getDailyCount(agent.id, dateKey);
    const hasDailyCapacity = agent.dailyCap == null || dailyCount < agent.dailyCap;
    const hasBalance = agent.balance == null || agent.balance > 0;

    if (hasDailyCapacity && hasBalance) {
      await incrementDailyCount(agent.id, dateKey);
      await decrementBalance(config, agent.id);
      const { apiUser, apiKey } = credentialsFor(agent);
      return { outcome: 'routed', agentId: agent.id, agentName: agent.name, apiUser, apiKey };
    }
  }

  // Nobody had capacity right now. If at least one non-default agent is
  // licensed here, hold the lead and retry once their daily cap resets.
  const holdCandidate = candidates.find(a => !a.isDefault);
  if (holdCandidate) {
    return { outcome: 'queued', queuedFor: holdCandidate.id, agentName: holdCandidate.name };
  }

  // Nobody is licensed here at all — not even the default agent's state
  // list. Should not normally happen if state lists are kept current.
  // Fall back to the default agent anyway, flagged for manual review, so
  // the lead is never silently dropped and still counts in that day's total.
  const defaultAgent = config.agents.find(a => a.isDefault);
  if (defaultAgent) {
    await incrementDailyCount(defaultAgent.id, dateKey);
    const { apiUser, apiKey } = credentialsFor(defaultAgent);
    return { outcome: 'unlicensed', agentId: defaultAgent.id, agentName: defaultAgent.name, apiUser, apiKey };
  }

  return { outcome: 'unlicensed' };
}

async function getDailyHistory(agentId) {
  const s = store();
  const { blobs } = await s.list({ prefix: `daily:${agentId}:` });
  const results = await Promise.all(blobs.map(async (b) => {
    const date = b.key.split(':')[2]; // daily:<agentId>:<YYYY-MM-DD>
    const count = await s.get(b.key, { type: 'json' });
    return { date, count: count || 0 };
  }));
  results.sort((a, b) => a.date.localeCompare(b.date));
  return results;
}

module.exports = {
  loadConfig,
  saveConfig,
  getStateAbbrev,
  todayEastern,
  getDailyCount,
  getDailyHistory,
  setDailyCount,
  getQueue,
  pushToQueue,
  setQueue,
  credentialsFor,
  routeLead
};
