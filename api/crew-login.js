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

  // Debug logging for deployed Vercel instances.
  // Set DEBUG_CREW_LOGIN=false in production if you do not want raw credentials in logs.
  const shouldLogCredentials = process.env.DEBUG_CREW_LOGIN !== 'false';
  if (shouldLogCredentials) {
    console.log('[crew-login] incoming credentials', {
      identifier,
      password,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
    });
  }

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Credentials are required.' });
  }

  // Read allowed credentials from Vercel environment variables
  // These MUST be set in Vercel dashboard → Settings → Environment Variables
  // NEVER put real values here or in .env (only .env.local which is gitignored)
  const allowedUsername = process.env.CREW_USERNAME;
  const allowedPasswordHash = process.env.CREW_PASSWORD_HASH; // SHA-256 hex of password

  if (!allowedUsername || !allowedPasswordHash) {
    console.error('[crew-login] CREW_USERNAME or CREW_PASSWORD_HASH env vars not configured.', {
      hasUsername: Boolean(allowedUsername),
      hasPasswordHash: Boolean(allowedPasswordHash),
      identifier,
      password,
    });
    return res.status(503).json({
      success: false,
      message: 'Authentication service not configured. Add CREW_USERNAME and CREW_PASSWORD_HASH in Vercel → Settings → Environment Variables.',
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

  // Generate a simple session token (replace with JWT or Supabase session later)
  const sessionToken = crypto
    .createHash('sha256')
    .update(`${allowedUsername}:${Date.now()}:${Math.random()}`)
    .digest('hex');

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

