import crypto from 'crypto';

export const HOLI_GALLERY_OPEN_TIME = new Date('2026-11-18T00:00:00+05:30').getTime();

export function getGalleryScriptConfig() {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const readToken = process.env.GOOGLE_SHEET_READ_TOKEN;

  if (!webhookUrl || !readToken || readToken.length < 32) {
    throw new Error('Google Sheets gallery integration is not configured.');
  }

  return { webhookUrl, readToken };
}

export async function callGalleryScript(action, params = {}, body) {
  const { webhookUrl, readToken } = getGalleryScriptConfig();
  const scriptUrl = new URL(webhookUrl);
  scriptUrl.searchParams.set('action', action);
  scriptUrl.searchParams.set('readToken', readToken);

  for (const [key, value] of Object.entries(params)) {
    scriptUrl.searchParams.set(key, String(value));
  }

  const response = await fetch(scriptUrl.toString(), {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined
      ? { Accept: 'application/json' }
      : { 'Content-Type': 'text/plain;charset=utf-8' },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Google Apps Script gallery request failed.');
  }

  const result = await response.json();
  if (!result || typeof result !== 'object') {
    throw new Error('Google Apps Script returned an invalid gallery response.');
  }

  return result;
}

export async function getDriveAccessToken() {
  const email = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error('Google Drive gallery access is not configured.');
  }

  const base64Url = (value) => Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsignedAssertion = `${header}.${claims}`;
  const signature = crypto
    .sign('RSA-SHA256', Buffer.from(unsignedAssertion), privateKey)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsignedAssertion}.${signature}`,
    }),
  });

  const result = await response.json();
  if (!response.ok || typeof result?.access_token !== 'string') {
    throw new Error('Unable to authorize the gallery image service with Google Drive.');
  }

  return result.access_token;
}
