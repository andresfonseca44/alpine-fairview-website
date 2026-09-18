// ==========================================================================
// ADMIN API: Manage lead-routing agents
// Backs the /admin page. Requires the ADMIN_PASSWORD env var to match the
// x-admin-password header on every request.
//
// GET  -> returns current config + today's daily counts + queue lengths
// POST -> { action, ...fields }
//   action: "addBalance"   { agentId, amount }        add to an agent's order balance
//   action: "setBalance"   { agentId, amount }         set an agent's order balance directly
//   action: "setDailyCap"  { agentId, dailyCap }        change daily cap (null = unlimited)
//   action: "setStates"    { agentId, states: [...] }   replace an agent's licensed-state list
//   action: "setActive"    { agentId, active: bool }    pause/resume an agent
//   action: "createAgent"  { agent: {...} }             add a new agent
// ==========================================================================

const { connectLambda } = require('@netlify/blobs');
const { loadConfig, saveConfig, todayEastern, getDailyCount, getDailyHistory, getQueue } = require('./lib/lead-routing');

exports.handler = async (event) => {
  connectLambda(event); // required for Netlify Blobs in Lambda-compatibility mode

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const suppliedPassword = event.headers['x-admin-password'] || event.headers['X-Admin-Password'];
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword || suppliedPassword !== expectedPassword) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const config = await loadConfig();
      const dateKey = todayEastern();

      const agentsWithStatus = await Promise.all(config.agents.map(async (agent) => {
        const dailyCount = await getDailyCount(agent.id, dateKey);
        const queue = agent.isDefault ? [] : await getQueue(agent.id);
        const history = await getDailyHistory(agent.id);
        return { ...agent, dailyCountToday: dailyCount, queueLength: queue.length, history };
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ agents: agentsWithStatus, dateKey }) };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const config = await loadConfig();
    const agent = body.agentId ? config.agents.find(a => a.id === body.agentId) : null;

    switch (body.action) {
      case 'addBalance': {
        if (!agent) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Agent not found' }) };
        agent.balance = (typeof agent.balance === 'number' ? agent.balance : 0) + Number(body.amount || 0);
        break;
      }
      case 'setBalance': {
        if (!agent) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Agent not found' }) };
        agent.balance = Number(body.amount);
        break;
      }
      case 'setDailyCap': {
        if (!agent) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Agent not found' }) };
        agent.dailyCap = body.dailyCap === null ? null : Number(body.dailyCap);
        break;
      }
      case 'setStates': {
        if (!agent) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Agent not found' }) };
        agent.states = (body.states || []).map(s => String(s).trim().toUpperCase());
        break;
      }
      case 'setActive': {
        if (!agent) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Agent not found' }) };
        agent.active = !!body.active;
        break;
      }
      case 'setName': {
        if (!agent) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Agent not found' }) };
        if (!body.name || !String(body.name).trim()) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'name is required' }) };
        }
        agent.name = String(body.name).trim();
        break;
      }
      case 'createAgent': {
        const newAgent = body.agent;
        if (!newAgent || !newAgent.id || !newAgent.apiUserEnv || !newAgent.apiKeyEnv) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'agent.id, agent.apiUserEnv, and agent.apiKeyEnv are required' }) };
        }
        if (config.agents.some(a => a.id === newAgent.id)) {
          return { statusCode: 409, headers, body: JSON.stringify({ error: 'Agent id already exists' }) };
        }
        config.agents.push({
          id: newAgent.id,
          name: newAgent.name || newAgent.id,
          active: true,
          isDefault: false,
          priority: typeof newAgent.priority === 'number' ? newAgent.priority : 10,
          states: (newAgent.states || []).map(s => String(s).trim().toUpperCase()),
          dailyCap: newAgent.dailyCap != null ? Number(newAgent.dailyCap) : null,
          balance: newAgent.balance != null ? Number(newAgent.balance) : null,
          apiUserEnv: newAgent.apiUserEnv,
          apiKeyEnv: newAgent.apiKeyEnv
        });
        break;
      }
      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    await saveConfig(config);
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', agents: config.agents }) };
  } catch (err) {
    console.error('❌ [ADMIN-AGENTS] Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
