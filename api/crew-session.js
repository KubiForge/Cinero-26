import crypto from 'crypto';

const getCookieValue = (req, name) => {
  const cookieHeader = req.headers.cookie || '';
  const cookieMatch = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  if (!cookieMatch) return '';
  return decodeURIComponent(cookieMatch.slice(name.length + 1));
};

const verifySessionToken = (token, username, sessionSecret) => {
  const [issuedAt, signature] = String(token || '').split('.');

  if (!/^\d+$/.test(issuedAt || '') || !/^[a-f\d]{64}$/i.test(signature || '')) return false;

  const expectedSignature = crypto
    .createHmac('sha256', sessionSecret)
    .update(`${username}:${issuedAt}`)
    .digest('hex');

  if (signature.length !== expectedSignature.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const username = process.env.CREW_USERNAME;
  const sessionSecret = process.env.CREW_SESSION_SECRET;
  if (!username || !sessionSecret || sessionSecret.length < 32) {
    return res.status(503).json({ success: false, message: 'HR authentication is not configured.' });
  }

  const sessionToken = getCookieValue(req, 'crew_session');
  if (!sessionToken || !verifySessionToken(sessionToken, username, sessionSecret)) {
    if (process.env.DEBUG_CREW_LOGIN === 'true') {
      console.info('[crew-session] rejected cookie session', {
        hasToken: Boolean(sessionToken),
        cookieName: 'crew_session',
      });
    }
    return res.status(401).json({ success: false, message: 'Session expired or invalid.' });
  }

  return res.status(200).json({
    success: true,
    message: 'Session valid.',
    user: {
      username,
      role: 'crew',
    },
  });
}
