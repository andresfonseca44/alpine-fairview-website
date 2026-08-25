exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { code, userCode } = JSON.parse(event.body || '{}');
    if (code && userCode && String(code) === String(userCode)) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, verified: true }) };
    }
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, verified: false, error: 'Invalid code' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
