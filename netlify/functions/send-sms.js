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
    const { phone } = JSON.parse(event.body || '{}');
    if (!phone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone number required' }) };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Twilio credentials missing');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'SMS service not configured' }) };
    }

    const digits = String(phone).replace(/\D/g, '');
    const toNumber = digits.length === 10 ? `+1${digits}` : `+${digits}`;
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const body = new URLSearchParams({
      To: toNumber,
      From: twilioPhone,
      Body: `Your Alpine Fairview verification code is: ${verificationCode}. Valid for 10 minutes.`
    });

    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error('Twilio error:', twilioData);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to send SMS' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, code: verificationCode, expiresIn: 600 }) };
  } catch (err) {
    console.error('send-sms error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
