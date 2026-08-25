// ==========================================================================
// NETLIFY FUNCTION: DigitalBGA CRM Inbound Lead Handler
// Endpoint: /.netlify/functions/digitalBGA-lead
// Target CRM: https://api.crm.digitalseniorbenefits.com/inbound-lead/
// ==========================================================================

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
  "MISSOURI": 25, "MO": 25,  "MONTANA": 27, "MT": 27,
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

exports.handler = async (event, context) => {
  // Support CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Extract Environment Variables for DigitalBGA
    const api_user = process.env.DIGITALBGA_API_USER || process.env.api_user || '';
    const api_key = process.env.DIGITALBGA_API_KEY || process.env.api_key || '';

    // Validate Required Fields
    const email = (data.email || '').trim();
    const rawState = data.state || data.stateOfBirth || '';
    const stateCode = getNumericStateCode(rawState);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Validation Error: email is required.' })
      };
    }

    if (!stateCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Validation Error: valid US state is required.' })
      };
    }

    // Name parsing
    let firstName = (data.firstName || data.first_name || '').trim();
    let lastName = (data.lastName || data.last_name || '').trim();
    if (!firstName && data.name) {
      const parts = data.name.trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    // Coverage parsing (5k-50k)
    let faceAmount = parseInt(data.coverageAmount || data.coverage || data.face_amount || 25000, 10);
    if (isNaN(faceAmount)) faceAmount = 25000;

    // Build sticky note with age, DOB, smoker status, coverage, and quoted premium
    const rateStr = data.estimatedMonthlyRate || data.rate || 'N/A';
    const ageStr = data.age || 'N/A';
    const dobStr = data.dob || 'N/A';
    const smokerStr = data.nicotineUse || 'N/A';
    const coverageStr = data.coverageAmount || ('$' + faceAmount.toLocaleString());

    const stickyNote = `[AF LEAD] - Age: ${ageStr} (DOB: ${dobStr}) Smoker: ${smokerStr} Coverage amount: ${coverageStr} Premium: ${rateStr}`;

    // Payload formatted for DigitalBGA CRM API
    const genderCode = /^F/i.test(String(data.gender || 'Male').trim()) ? 30 : 35;
    const digitalBgaPayload = {
      api_user: api_user,
      api_key: api_key,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: (data.phone || '').replace(/\D/g, ''),
      state: stateCode,
      face_amount: faceAmount,
      policy_type: 570, // Final Expense
      sticky_note: stickyNote.slice(0, 220),
      gender: genderCode,
      dob: data.dob || ''
    };

    console.log('🚀 Posting lead to DigitalBGA CRM API:', digitalBgaPayload);

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

    if (apiResponse.ok || responseText.includes('success')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'success',
          message: 'Thanks! We received your information.',
          digitalBgaResponse: responseData
        })
      };
    } else {
      return {
        statusCode: apiResponse.status || 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          error: responseText || 'Failed to submit lead to DigitalBGA CRM.'
        })
      };
    }

  } catch (err) {
    console.error('❌ Netlify Function Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' })
    };
  }
};
