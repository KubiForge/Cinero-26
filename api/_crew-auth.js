import crypto from 'crypto';

function getCrewSessionToken(req) {
  const cookieHeader = req.headers?.cookie || '';
  const cookie = cookieHeader
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith('crew_session='));

  if (!cookie) return '';

  try {
    return decodeURIComponent(cookie.slice('crew_session='.length));
  } catch {
    return '';
  }
}

export function getCrewAuthStatus(req) {
  const username = process.env.CREW_USERNAME;
  const sessionSecret = process.env.CREW_SESSION_SECRET;
  if (!username || !sessionSecret || sessionSecret.length < 32) {
    return { configured: false, authenticated: false, username: '' };
  }

  const [issuedAt, signature] = getCrewSessionToken(req).split('.');
  if (!/^\d+$/.test(issuedAt || '') || !/^[a-f\d]{64}$/i.test(signature || '')) {
    return { configured: true, authenticated: false, username };
  }

  const expectedSignature = crypto
    .createHmac('sha256', sessionSecret)
    .update(`${username}:${issuedAt}`)
    .digest('hex');
  const authenticated = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex'),
  );

  return { configured: true, authenticated, username };
}
