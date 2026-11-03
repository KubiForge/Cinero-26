const CREW_ACTIONS = new Set(['login', 'validate', 'dashboard', 'logout']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.',
    });
  }

  if (typeof req.body === 'string' && req.body.length > 8192) {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large.',
    });
  }

  const payload = typeof req.body === 'string'
    ? parseRequestBody(req.body)
    : req.body;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({
      success: false,
      message: 'Request body is not valid JSON.',
    });
  }

  if (!CREW_ACTIONS.has(payload.action)) {
    return res.status(400).json({
      success: false,
      message: 'Unknown crew request.',
    });
  }

  let upstreamPayload;
  if (payload.action === 'login') {
    if (
      typeof payload.username !== 'string' ||
      typeof payload.password !== 'string' ||
      !payload.username.trim() ||
      !payload.password ||
      payload.username.length > 128 ||
      payload.password.length > 256
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid username and password.',
      });
    }
    upstreamPayload = {
      action: 'login',
      username: payload.username,
      password: payload.password,
    };
  } else {
    if (typeof payload.token !== 'string' || !payload.token || payload.token.length > 256) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
      });
    }
    upstreamPayload = { action: payload.action, token: payload.token };
  }

  const endpoint = process.env.GOOGLE_APPS_SCRIPT_CREW_URL;
  if (!isValidAppsScriptUrl(endpoint)) {
    return res.status(500).json({
      success: false,
      message: 'The crew service is not configured. Set GOOGLE_APPS_SCRIPT_CREW_URL in the deployment environment.',
    });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(upstreamPayload),
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('The crew service returned an invalid response.');
    }

    if (
      payload.action === 'login' &&
      result.success !== true &&
      typeof result.status === 'string'
    ) {
      return res.status(503).json({
        success: false,
        message: 'The crew service is not deployed yet. Follow the setup steps in README.md.',
      });
    }

    const statusCode = Number(result.statusCode);
    if (result.success !== true) {
      const errorStatus = [400, 401, 429, 503].includes(statusCode)
        ? statusCode
        : 502;
      return res.status(errorStatus).json({
        success: false,
        message: typeof result.message === 'string'
          ? result.message
          : 'The crew service could not complete the request.',
      });
    }

    if (payload.action === 'login') {
      if (
        typeof result.token !== 'string' ||
        !result.token ||
        !Number.isInteger(result.expiresIn)
      ) {
        throw new Error('The crew service returned an invalid login response.');
      }
      return res.status(200).json({
        success: true,
        token: result.token,
        expiresIn: result.expiresIn,
      });
    }

    if (payload.action === 'dashboard') {
      if (!result.dashboard || typeof result.dashboard !== 'object') {
        throw new Error('The crew service returned an invalid dashboard response.');
      }
      return res.status(200).json({
        success: true,
        dashboard: result.dashboard,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Crew portal API error:', error);
    return res.status(502).json({
      success: false,
      message: 'Unable to reach the crew service. Please try again.',
    });
  }
}

function parseRequestBody(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function isValidAppsScriptUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === 'script.google.com' &&
      /^\/macros\/s\/[^/]+\/exec$/.test(url.pathname);
  } catch {
    return false;
  }
}
