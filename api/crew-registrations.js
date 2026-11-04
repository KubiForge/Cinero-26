import crypto from 'crypto';

const getTokenValue = (req) => {
  const authHeader = req.headers?.authorization || req.headers?.['x-crew-token'];
  if (typeof authHeader === 'string') {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('crew_session='));

  if (match) {
    return decodeURIComponent(match.slice('crew_session='.length));
  }

  const url = req.url || '';
  const [pathname, queryString = ''] = url.split('?');
  if (!queryString) return '';

  const params = new URLSearchParams(queryString);
  return params.get('token') || '';
};

const verifySessionToken = (token, username, sessionSecret) => {
  const [issuedAt, signature] = String(token || '').split('.');

  if (!/^\d+$/.test(issuedAt || '') || !/^[a-f\d]{64}$/i.test(signature || '')) return false;

  const expectedSignature = crypto
    .createHmac('sha256', sessionSecret)
    .update(`${username}:${issuedAt}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.',
    });
  }

  const username = process.env.CREW_USERNAME;
  const sessionSecret = process.env.CREW_SESSION_SECRET;
  if (!username || !sessionSecret || sessionSecret.length < 32) {
    return res.status(503).json({
      success: false,
      message: 'HR authentication is not configured.',
    });
  }

  const sessionToken = getTokenValue(req);
  if (!sessionToken || !verifySessionToken(sessionToken, username, sessionSecret)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please log in again.',
    });
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({
      success: false,
      message: 'Google Sheets integration is not configured.',
    });
  }

  const readToken = process.env.GOOGLE_SHEET_READ_TOKEN;
  if (!readToken || readToken.length < 32) {
    return res.status(503).json({
      success: false,
      message: 'Google Sheets read authorization is not configured.',
    });
  }

  try {
    const rawUrl = req.url || '';
    const requestUrl = new URL(rawUrl, 'https://localhost');
    const category = String(requestUrl.searchParams.get('category') || req.query?.category || 'all').toLowerCase();
    const scriptUrl = new URL(webhookUrl);
    scriptUrl.searchParams.set('action', 'read');
    scriptUrl.searchParams.set('category', category);
    scriptUrl.searchParams.set('readToken', readToken);

    const response = await fetch(scriptUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Unable to fetch registration data.');
    }

    const result = await response.json();
    if (result?.status !== 'success') {
      throw new Error('Google Sheets denied the registration data request.');
    }

    const records = Array.isArray(result?.records) ? result.records : [];

    return res.status(200).json({
      success: true,
      records,
      total: records.length,
      category,
    });
  } catch (error) {
    console.error('[crew-registrations] fetch failed:', error);
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to load registrations.',
    });
  }
}
