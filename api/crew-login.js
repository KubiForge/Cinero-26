import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  // Rate limit hint: in production consider adding upstash/redis rate limiting
  const { identifier, password } = typeof req.body === 'string'
    ? JSON.parse(req.body)
    : req.body ?? {};

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Credentials are required.' });
  }

  // Read allowed credentials from Vercel environment variables
  // These MUST be set in Vercel dashboard → Settings → Environment Variables
  // NEVER put real values here or in .env (only .env.local which is gitignored)
  const allowedUsername = process.env.CREW_USERNAME;
  const allowedPasswordHash = process.env.CREW_PASSWORD_HASH; // SHA-256 hex of password
  const sessionSecret = process.env.CREW_SESSION_SECRET;

  if (!allowedUsername || !allowedPasswordHash || !sessionSecret || sessionSecret.length < 32) {
    console.error('[crew-login] Required authentication environment variables are not configured.', {
      hasUsername: Boolean(allowedUsername),
      hasPasswordHash: Boolean(allowedPasswordHash),
      hasValidSessionSecret: Boolean(sessionSecret && sessionSecret.length >= 32),
    });
    return res.status(503).json({
      success: false,
      message: 'Authentication service not configured. Set CREW_USERNAME, CREW_PASSWORD_HASH, and a 32-character-or-longer CREW_SESSION_SECRET in the server environment.',
    });
  }

  // Hash the incoming password with SHA-256 for comparison
  const inputHash = crypto
    .createHash('sha256')
    .update(password, 'utf8')
    .digest('hex');

  const usernameMatch =
    identifier.trim().toLowerCase() === allowedUsername.trim().toLowerCase();
  const passwordMatch = inputHash === allowedPasswordHash.toLowerCase();

  if (!usernameMatch || !passwordMatch) {
    // Use the same delay and same message to prevent user enumeration
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
    return res.status(401).json({
      success: false,
      message: 'Incorrect credentials. Please try again.',
    });
  }

  const issuedAt = Date.now();
  const signature = crypto
    .createHmac('sha256', sessionSecret)
    .update(`${allowedUsername}:${issuedAt}`)
    .digest('hex');

  const sessionToken = `${issuedAt}.${signature}`;
  const isSecureRequest = req.headers['x-forwarded-proto'] === 'https' || req.headers.origin?.startsWith('https://');
  const cookieAttributes = [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 8}`,
    isSecureRequest ? 'Secure' : '',
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', `crew_session=${sessionToken}; ${cookieAttributes}`);

  if (process.env.DEBUG_CREW_LOGIN === 'true') {
    console.info('[crew-login] session created', {
      username: allowedUsername,
      issuedAt,
      secureCookie: isSecureRequest,
      cookiePath: '/',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful.',
    token: sessionToken,
    user: {
      username: allowedUsername,
      role: 'crew',
    },
  });
}
