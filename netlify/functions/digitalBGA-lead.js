// ==========================================================================
// NETLIFY FUNCTION: DigitalBGA CRM & Google Sheets Dual Inbound Lead Handler
// Endpoint: /.netlify/functions/digitalBGA-lead
// Target CRM: https://api.crm.digitalseniorbenefits.com/inbound-lead/
// Target Sheet: https://docs.google.com/spreadsheets/d/1d3L_vrC8q47jVJnZZpkJ-XdYlMNBdVs4le8PV_DfKBE/edit
// Destination: Andres Fonseca's DigitalBGA CRM Account & Google Sheets
// ==========================================================================

const crypto = require('crypto');
const { routeLead, pushToQueue } = require('./lib/lead-routing');

const STATE_CODE_MAP = {
  "ALABAMA": 1, "AL": 1,
  "ALASKA": 2, "AK": 2,
  "ARIZONA": 3, "AZ": 3,
  "ARKANSAS": 4, "AR": 4,
  "CALIFORNIA": 5, "CA": 5,
  "COLORADO": 6, "CO": 6,
  "CONNECTICUT": 7, "CT": 7,
  "DELAWARE": 8, "DE": 8,
  "DISTRICT OF COLUMBIA": 9, "WASHINGTON DC": 9, "DC": 9,
  "FLORIDA": 10, "FL": 10,
  "GEORGIA": 11, "GA": 11,
  "HAWAII": 12, "HI": 12,
  "IDAHO": 13, "ID": 13,
  "ILLINOIS": 14, "IL": 14,
  "INDIANA": 15, "IN": 15,
  "IOWA": 16, "IA": 16,
  "KANSAS": 17, "KS": 17,
  "KENTUCKY": 18, "KY": 18,
  "LOUISIANA": 19, "LA": 19,
  "MAINE": 20, "ME": 20,
  "MARYLAND": 21, "MD": 21,
  "MASSACHUSETTS": 22, "MA": 22,
  "MICHIGAN": 23, "MI": 23,
  "MINNESOTA": 24, "MN": 24,
  "MISSISSIPPI": 26, "MS": 26,
  "MISSOURI": 25, "MO": 25, "MONTANA": 27, "MT": 27,
  "NEBRASKA": 28, "NE": 28,
  "NEVADA": 29, "NV": 29,
  "NEW HAMPSHIRE": 30, "NH": 30,
  "NEW JERSEY": 31, "NJ": 31,
  "NEW MEXICO": 32, "NM": 32,
  "NEW YORK": 33, "NY": 33,
  "NORTH CAROLINA": 34, "NC": 34,
  "NORTH DAKOTA": 35, "ND": 35,
  "OHIO": 36, "OH": 36,
  "OKLAHOMA": 37, "OK": 37,
  "OREGON": 38, "OR": 38,
  "PENNSYLVANIA": 39, "PA": 39,
  "RHODE ISLAND": 40, "RI": 40,
  "SOUTH CAROLINA": 41, "SC": 41,
  "SOUTH DAKOTA": 42, "SD": 42,
  "TENNESSEE": 43, "TN": 43,
  "TEXAS": 44, "TX": 44,
  "UTAH": 45, "UT": 45,
  "VERMONT": 46, "VT": 46,
  "VIRGINIA": 47, "VA": 47,
  "WASHINGTON": 48, "WA": 48,
  "WEST VIRGINIA": 49, "WV": 49,
  "WISCONSIN": 50, "WI": 50,
  "WYOMING": 51, "WY": 51,
  "PUERTO RICO": 52, "PR": 52
};

function getNumericStateCode(stateInput) {
  if (!stateInput) return null;
  if (typeof stateInput === 'number') return stateInput;
  
  const cleanInput = String(stateInput).trim().toUpperCase();
  if (/^\d+$/.test(cleanInput)) return parseInt(cleanInput, 10);
  
  return STATE_CODE_MAP[cleanInput] || null;
}

const AGENCY = { 
  name: "Alpine Fairview Group", 
  phone: "7738000116", 
  email: "andres@alpinefairview.com" 
};

// EMAIL NOTIFICATION DISPATCHER FOR ALPINE FAIRVIEW GROUP
async function sendEmailNotification(data) {
  const recipients = ["andres@alpinefairview.com", "support@alpinefairview.com"];
  const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Applicant';
  const coverage = data.coverageStr || '$25,000';
  const rate = data.rateStr ? ` (${data.rateStr})` : '';
  const subject = `🚨 NEW LEAD (Alpine Fairview): ${fullName} - ${coverage}${rate}`;

  const textBody = `
==================================================
🚨 NEW ALPINE FAIRVIEW LEAD NOTIFICATION
==================================================

DESTINATION: Andres Fonseca / Alpine Fairview Group (${AGENCY.email})

APPLICANT INFORMATION:
-----------------------
• Full Name: ${fullName}
• Phone: ${data.cleanPhone || data.phone || 'N/A'}
• Email: ${data.email || 'N/A'}
• Date of Birth: ${data.formattedDob || data.dob || 'N/A'}
• Gender: ${data.gender || 'Male'}
• State of Residence: ${data.rawState || 'N/A'}

COVERAGE QUOTE DETAILS:
-----------------------
• Whole Life Benefit: ${coverage}
• Estimated Premium: ${data.rateStr || 'N/A'}

LEAD INSIGHTS & MOTIVATION:
---------------------------
• Motivation / Trigger: ${data.motivationStr || data.factor || 'N/A'}
• Nicotine / Smoker: ${data.smokerStr || 'No'}
• Goals: ${data.goals || 'N/A'}

CRM STICKY NOTE:
----------------
${data.stickyNote || 'N/A'}

==================================================
`;

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Alpine Fairview Leads <leads@alpinefairview.com>',
          to: recipients,
          subject: subject,
          text: textBody
        })
      });
      console.log('📧 [EMAIL DISPATCH] Lead notification sent via Resend to:', recipients);
      return;
    } catch (e) {
      console.warn('⚠️ Resend email notice:', e);
    }
  }

  // 2. SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: recipients.map(email => ({ email })) }],
          from: { email: 'support@alpinefairview.com', name: 'Alpine Fairview Lead Alert' },
          subject: subject,
          content: [{ type: 'text/plain', value: textBody }]
        })
      });
      console.log('📧 [EMAIL DISPATCH] Lead notification sent via SendGrid to:', recipients);
      return;
    } catch (e) {
      console.warn('⚠️ SendGrid email notice:', e);
    }
  }

  // 3. Web3Forms Dispatch Fallback
  try {
    const web3FormData = {
      access_key: process.env.WEB3FORMS_ACCESS_KEY || '52d586ef-a3d8-4fbb-9189-alpinefairview',
      email: recipients.join(','),
      subject: subject,
      message: textBody,
      from_name: `Alpine Fairview Lead Gen`
    };
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(web3FormData)
    });
    console.log('📧 [EMAIL DISPATCH] Lead notification dispatched via Web3Forms to:', recipients);
  } catch (e) {
    console.warn('⚠️ Web3Forms notification notice:', e);
  }
}

// ==========================================================================
// GOOGLE SHEETS API V4 INTEGRATION (Zero-dependency Service Account JWT)
// ==========================================================================
async function getGoogleAccessToken(clientEmail, privateKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str) =>
    Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);

  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
  const signature = signer.sign(formattedPrivateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString()
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`Google OAuth Token Error [${tokenRes.status}]: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

async function appendLeadToGoogleSheet(leadData) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1d3L_vrC8q47jVJnZZpkJ-XdYlMNBdVs4le8PV_DfKBE';
  const range = process.env.GOOGLE_SHEET_RANGE || 'A:J';

  let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const saJson = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      clientEmail = saJson.client_email;
      privateKey = saJson.private_key;
    } catch (e) {
      console.warn('⚠️ Could not parse GOOGLE_SERVICE_ACCOUNT_JSON:', e.message);
    }
  }

  if (!clientEmail || !privateKey) {
    console.warn('⚠️ Google Sheets credentials missing (GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY). Skipping Sheet append.');
    return;
  }

  try {
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);

    // Columns:
    // 1. Timestamp (date and time the lead was generated)
    // 2. First Name
    // 3. Last Name
    // 4. Date of Birth
    // 5. Gender
    // 6. State
    // 7. Phone Number
    // 8. Email Address
    // 9. Sticky Note
    // 10. Routed To (which agent's DigitalBGA account this lead was sent to)
    const timestamp = new Date().toISOString();
    const rowValues = [
      timestamp,
      leadData.firstName || '',
      leadData.lastName || '',
      leadData.formattedDob || leadData.dob || '',
      leadData.gender || 'Male',
      leadData.rawState || '',
      leadData.cleanPhone || leadData.phone || '',
      leadData.email || '',
      leadData.stickyNote || '',
      leadData.routedTo || ''
    ];

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    const sheetsRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [rowValues]
      })
    });

    const sheetsData = await sheetsRes.json();
    if (!sheetsRes.ok) {
      throw new Error(`Google Sheets API Error [${sheetsRes.status}]: ${JSON.stringify(sheetsData)}`);
    }

    console.log('📊 [GOOGLE SHEETS DISPATCH] Row successfully appended to Google Sheet:', sheetsData.updates || sheetsData);
  } catch (err) {
    // Non-blocking error handling: log error but DO NOT block or fail DigitalBGA submission
    console.error('❌ [GOOGLE SHEETS DISPATCH ERROR] Failed to append lead to Google Sheet:', err.message || err);
  }
}

exports.handler = async (event, context) => {
  // Support CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'online',
        destination: "Routed by state/agent config — see /admin",
        agent: AGENCY
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST or GET.' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Validate Required Fields
    const email = (data.email || '').trim();
    const rawState = data.state || data.stateOfBirth || '';
    const stateCode = getNumericStateCode(rawState) || 10; // Default to FL (10) if unparsed

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Validation Error: email is required.' })
      };
    }

    // Determine which agent's DigitalBGA account this lead goes to, based
    // on state licensing, daily caps, and remaining order balance.
    const routing = await routeLead(rawState);
    let api_user, api_key, routedToLabel;

    if (routing.outcome === 'routed') {
      api_user = routing.apiUser;
      api_key = routing.apiKey;
      routedToLabel = routing.agentName;
      if (!api_user || !api_key) {
        console.error(`❌ Missing DigitalBGA credentials for agent "${routing.agentName}" — check Netlify env vars.`);
      }
    } else if (routing.outcome === 'queued') {
      routedToLabel = `Queued → ${routing.agentName} (retry when daily cap resets)`;
    } else {
      // 'unlicensed' — routeLead() already fell back to the default agent
      // (flagged for manual review) and incremented that day's count for
      // reporting; just use the credentials it resolved.
      api_user = routing.apiUser || (process.env.DIGITALBGA_API_USER || '').trim();
      api_key = routing.apiKey || (process.env.DIGITALBGA_API_KEY || '').trim();
      routedToLabel = routing.agentName
        ? `${routing.agentName} (⚠️ UNLICENSED STATE — manual review)`
        : 'Andres Fonseca (⚠️ UNLICENSED STATE — manual review)';
    }

    // Name parsing
    let firstName = (data.firstName || data.first_name || '').trim();
    let lastName = (data.lastName || data.last_name || '').trim();
    if (!firstName && data.name) {
      const parts = data.name.trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    // Face Amount
    let rawCoverage = String(data.coverageAmount || data.coverageStr || '').replace(/\D/g, '');
    let faceAmount = rawCoverage ? parseInt(rawCoverage, 10) : 10000;

    // Format DOB to MM/DD/YYYY
    let formattedDob = '';
    if (data.dobMonth && data.dobDay && data.dobYear) {
      const m = String(data.dobMonth).padStart(2, '0');
      const d = String(data.dobDay).padStart(2, '0');
      const y = String(data.dobYear);
      formattedDob = `${m}/${d}/${y}`;
    } else if (data.dob) {
      const parts = String(data.dob).split('/');
      if (parts.length === 3) {
        const m = parts[0].padStart(2, '0');
        const d = parts[1].padStart(2, '0');
        const y = parts[2];
        formattedDob = `${m}/${d}/${y}`;
      } else {
        formattedDob = String(data.dob);
      }
    }

    const cleanPhone = String(data.phone || '').replace(/\D/g, '').slice(-10);
    const nicotineVal = String(data.nicotineUse || '').toLowerCase();
    const smokerStr = nicotineVal.includes('yes') ? 'Yes' : 'No';

    const rawFactor = String(data.factor || data.motivation || data.trigger || '').toLowerCase();
    let motivationStr = 'other';
    if (rawFactor.includes('employer') || rawFactor.includes('losing')) {
      motivationStr = 'Losing coverage';
    } else if (rawFactor.includes('expensive') || rawFactor.includes('ending') || rawFactor.includes('current policy')) {
      motivationStr = 'current policy too $ / end';
    } else if (rawFactor.includes('health') || rawFactor.includes('scare')) {
      motivationStr = 'health scare';
    } else if (rawFactor.includes('death') || rawFactor.includes('loved one')) {
      motivationStr = 'death of loved one';
    }

    let coverageStr = '$' + faceAmount.toLocaleString();

    let rawRate = String(data.estimatedMonthlyRate || data.estimatedMonthlyRate10k || data.rateFor10k || data.rate || '').trim();
    let cleanRate = '';
    if (rawRate && rawRate !== 'N/A') {
      cleanRate = rawRate.replace(/\s*\/\s*(mo(nthly)?|m).*/gi, '').trim();
      if (!cleanRate.startsWith('$')) {
        cleanRate = '$' + cleanRate;
      }
      cleanRate = cleanRate + '/m';
    }

    const stickyNote = `[AF] - Smoker: ${smokerStr}. motivation: ${motivationStr}. ${coverageStr}${cleanRate ? ' ' + cleanRate : ''}`;

    // Send instant email notification to Andres
    sendEmailNotification({
      firstName,
      lastName,
      email,
      phone: cleanPhone,
      cleanPhone,
      formattedDob,
      gender: data.gender || 'Male',
      rawState,
      coverageStr,
      rateStr: cleanRate,
      motivationStr,
      smokerStr,
      goals: data.goals,
      stickyNote,
      routedTo: routedToLabel
    }).catch(err => console.warn('Email dispatch notice:', err));

    // Dispatch to Google Sheet (Non-blocking: protected by internal try/catch so DigitalBGA is never blocked)
    await appendLeadToGoogleSheet({
      firstName,
      lastName,
      email,
      cleanPhone,
      phone: cleanPhone,
      formattedDob,
      gender: data.gender || 'Male',
      rawState,
      stickyNote,
      routedTo: routedToLabel
    });

    // Payload formatted for DigitalBGA CRM API
    const genderCode = /^F/i.test(String(data.gender || 'Male').trim()) ? 30 : 35;
    const tobaccoCode = smokerStr === 'Yes' ? 75 : 70;
    const fullNameStr = `${firstName} ${lastName}`.trim();

    const digitalBgaPayload = {
      api_user: api_user,
      api_key: api_key,
      first_name: firstName,
      last_name: lastName,
      full_name: fullNameStr,
      email: email,
      mobile: cleanPhone,
      cell_phone: cleanPhone,
      cellphone: cleanPhone,
      cell: cleanPhone,
      state: stateCode,
      face_amount: faceAmount,
      policy_type: 570, // Final Expense
      sticky_note: stickyNote.slice(0, 220),
      gender: genderCode,
      tobacco: tobaccoCode,
      date_of_birth: formattedDob,
      dob: formattedDob
    };

    // If this lead is being held for a capped/exhausted agent, queue it
    // instead of posting to DigitalBGA now. process-queue.js flushes this
    // once that agent's daily cap resets (Blobs-backed, survives redeploys).
    if (routing.outcome === 'queued') {
      await pushToQueue(routing.queuedFor, {
        payload: digitalBgaPayload, // api_user/api_key filled in fresh at flush time
        rawState,
        queuedAt: new Date().toISOString()
      });

      console.log(`⏸️ Lead held for ${routing.agentName} — daily cap/balance reached. Will retry automatically.`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'queued',
          message: `Lead held for ${routing.agentName} — will be sent automatically once daily capacity resets.`,
          agent: AGENCY
        })
      };
    }

    console.log(`🚀 Posting lead to DigitalBGA CRM API (routed to: ${routedToLabel}):`, digitalBgaPayload);

    const formBody = new URLSearchParams();
    Object.entries(digitalBgaPayload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formBody.append(key, value);
      }
    });

    const apiResponse = await fetch('https://api.crm.digitalseniorbenefits.com/inbound-lead/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody.toString()
    });

    const responseText = await apiResponse.text();
    let responseData = {};
    try {
      responseData = JSON.parse(responseText);
    } catch(e) {
      responseData = { message: responseText };
    }

    console.log(`📥 DigitalBGA CRM Response [${apiResponse.status}]:`, responseData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        message: `Lead successfully posted to DigitalBGA CRM (routed to: ${routedToLabel})`,
        agent: AGENCY,
        digitalBgaResponse: responseData
      })
    };

  } catch (err) {
    console.error('❌ Netlify Function Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        error: err.message || 'Internal Server Error',
        agent: AGENCY
      })
    };
  }
};
