import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const REGISTRATION_OPEN_TIME = new Date('2026-10-27T00:00:00+05:30').getTime()
const REGISTRATION_CLOSE_TIME = new Date('2026-12-15T00:00:00+05:30').getTime()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'local-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {

            // ── /api/crew-login local proxy ───────────────────────────────
            if (req.url === '/api/crew-login' && req.method === 'POST') {
              let body = ''
              req.on('data', (chunk: Buffer) => { body += chunk })
              req.on('end', async () => {
                const crewUsername = env.CREW_USERNAME
                const crewPasswordHash = env.CREW_PASSWORD_HASH
                const sessionSecret = env.CREW_SESSION_SECRET

                if (!crewUsername || !crewPasswordHash || !sessionSecret || sessionSecret.length < 32) {
                  res.statusCode = 503
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({
                    success: false,
                    message: 'Auth not configured. Set CREW_USERNAME, CREW_PASSWORD_HASH, and a 32-character-or-longer CREW_SESSION_SECRET in your server environment.',
                  }))
                }

                try {
                  const parsed = JSON.parse(body) as { identifier?: string; password?: string }
                  const { identifier, password } = parsed

                  if (!identifier || !password) {
                    res.statusCode = 400
                    res.setHeader('Content-Type', 'application/json')
                    return res.end(JSON.stringify({ success: false, message: 'Credentials are required.' }))
                  }

                  const { createHash } = await import('crypto')
                  const inputHash = createHash('sha256').update(password, 'utf8').digest('hex')
                  const usernameMatch = identifier.trim().toLowerCase() === crewUsername.trim().toLowerCase()
                  const passwordMatch = inputHash === crewPasswordHash.toLowerCase()

                  if (!usernameMatch || !passwordMatch) {
                    await new Promise(r => setTimeout(r, 500))
                    res.statusCode = 401
                    res.setHeader('Content-Type', 'application/json')
                    return res.end(JSON.stringify({ success: false, message: 'Incorrect credentials. Please try again.' }))
                  }
                  const { createHmac } = await import('crypto')
                  const issuedAt = Date.now()
                  const token = `${issuedAt}.${createHmac('sha256', sessionSecret).update(`${crewUsername}:${issuedAt}`).digest('hex')}`
                  const isSecure = req.headers['x-forwarded-proto'] === 'https' || (typeof req.headers.origin === 'string' && req.headers.origin.startsWith('https://'))
                  const cookie = `crew_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}${isSecure ? '; Secure' : ''}`
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.setHeader('Set-Cookie', cookie)
                  return res.end(JSON.stringify({
                    success: true,
                    message: 'Login successful.',
                    token,
                    user: { username: crewUsername, role: 'crew' },
                  }))
                } catch {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'Invalid request.' }))
                }
              })
              return
            }

            // ── /api/registration local proxy ─────────────────────────────
            if (req.url === '/api/registration' && req.method === 'POST') {
              if (Date.now() < REGISTRATION_OPEN_TIME) {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                return res.end(
                  JSON.stringify({
                    success: false,
                    message: 'Registration has not started yet. Registration opens on 27 October 2026 at 12:00 AM Sri Lanka time.',
                  })
                )
              }

              if (Date.now() >= REGISTRATION_CLOSE_TIME) {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                return res.end(
                  JSON.stringify({
                    success: false,
                    message: 'Registration closed. The deadline has passed.',
                  })
                )
              }

              let body = ''
              req.on('data', chunk => {
                body += chunk
              })
              req.on('end', async () => {
                const webhookUrl = env.GOOGLE_SHEET_WEBHOOK_URL
                if (!webhookUrl) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(
                    JSON.stringify({
                      success: false,
                      message: 'GOOGLE_SHEET_WEBHOOK_URL is not configured in .env.local',
                    })
                  )
                }

                try {
                  const googleRes = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: body,
                    redirect: 'follow',
                  })

                  const responseBody: unknown = await googleRes.json()
                  if (!isRecord(responseBody)) {
                    throw new Error('Google Sheets returned an invalid response.')
                  }

                  const result = responseBody
                  const isSuccess =
                    result && (result.success === true || result.status === 'success')

                  if (!isSuccess) {
                    const message = typeof result.message === 'string'
                      ? result.message
                      : 'Google Sheets did not confirm save.'
                    throw new Error(message)
                  }

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(
                    JSON.stringify({
                      success: true,
                      message: typeof result.message === 'string'
                        ? result.message
                        : 'Registration saved successfully.',
                      referenceId: typeof result.referenceId === 'string'
                        ? result.referenceId
                        : undefined,
                    })
                  )
                } catch (err: unknown) {
                  console.error('Local registration API proxy error:', err)
                  res.statusCode = 502
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(
                    JSON.stringify({
                      success: false,
                      message: err instanceof Error
                        ? err.message
                        : 'Error communicating with Google Sheets',
                    })
                  )
                }
              })
              return
            }

            // ── /api/crew-session local proxy ─────────────────────────────
            if (req.url === '/api/crew-session' && req.method === 'GET') {
              const cookies = (req.headers.cookie || '').split(';').map(cookie => cookie.trim()).filter(Boolean)
              const crewCookie = cookies.find(cookie => cookie.startsWith('crew_session='))
              const tokenValue = crewCookie ? decodeURIComponent(crewCookie.slice('crew_session='.length)) : ''
              const username = env.CREW_USERNAME
              const secret = env.CREW_SESSION_SECRET

              if (!username || !secret || secret.length < 32) {
                res.statusCode = 503
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'HR authentication is not configured.' }))
              }

              if (!tokenValue) {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Session expired or invalid.' }))
              }

              const [issuedAt, signature] = tokenValue.split('.')
              if (!/^\d+$/.test(issuedAt || '') || !/^[a-f\d]{64}$/i.test(signature || '')) {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Session expired or invalid.' }))
              }

              const { createHmac, timingSafeEqual } = await import('crypto')
              const expected = createHmac('sha256', secret).update(`${username}:${issuedAt}`).digest('hex')
              const isValid = timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
              if (!isValid) {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Session expired or invalid.' }))
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ success: true, message: 'Session valid.', user: { username, role: 'crew' } }))
            }

            // ── /api/crew-registrations local proxy ──────────────────────
            if ((req.url ?? '').startsWith('/api/crew-registrations') && (req.method === 'GET' || req.method === 'POST')) {
              const requestPath = req.url ?? '/api/crew-registrations'
              const reqUrl = new URL(requestPath, 'http://localhost')
              const cookieHeader = req.headers.cookie || ''
              const cookieValueFromHeader = cookieHeader
                .split(';')
                .map(cookie => cookie.trim())
                .find(cookie => cookie.startsWith('crew_session='))
              const tokenHeader = req.headers.authorization || req.headers['x-crew-token']
              const tokenValue = typeof tokenHeader === 'string'
                ? tokenHeader.replace(/^Bearer\s+/i, '').trim()
                : (cookieValueFromHeader ? decodeURIComponent(cookieValueFromHeader.slice('crew_session='.length)) : reqUrl.searchParams.get('token') || '')
              const username = env.CREW_USERNAME
              const secret = env.CREW_SESSION_SECRET

              if (!username || !secret || secret.length < 32) {
                res.statusCode = 503
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'HR authentication is not configured.' }))
              }

              if (!tokenValue) {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Unauthorized. Please log in again.' }))
              }

              const [issuedAt, signature] = tokenValue.split('.')
              if (!/^\d+$/.test(issuedAt || '') || !/^[a-f\d]{64}$/i.test(signature || '')) {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Unauthorized. Please log in again.' }))
              }

              const { createHmac, timingSafeEqual } = await import('crypto')
              const expected = createHmac('sha256', secret).update(`${username}:${issuedAt}`).digest('hex')
              const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
              if (!isValid) {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Unauthorized. Please log in again.' }))
              }

              const webhookUrl = env.GOOGLE_SHEET_WEBHOOK_URL
              const readToken = env.GOOGLE_SHEET_READ_TOKEN
              if (!webhookUrl || !readToken || readToken.length < 32) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Google Sheets read integration is not configured.' }))
              }

              try {
                const scriptUrl = new URL(webhookUrl)
                scriptUrl.searchParams.set('action', 'read')
                scriptUrl.searchParams.set('category', reqUrl.searchParams.get('category') || 'all')
                scriptUrl.searchParams.set('readToken', readToken)
                const googleRes = await fetch(scriptUrl.toString(), {
                  method: 'GET',
                  headers: { Accept: 'application/json' },
                })

                if (!googleRes.ok) {
                  throw new Error('Unable to fetch data from Google Sheets.')
                }

                const responseBody: unknown = await googleRes.json()
                if (!isRecord(responseBody)) {
                  throw new Error('Google Sheets returned invalid data.')
                }

                if (responseBody.status !== 'success') {
                  throw new Error('Google Sheets denied the registration data request.')
                }

                const records = Array.isArray(responseBody.records) ? responseBody.records : []
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: true, records, total: records.length }))
              } catch (err: unknown) {
                console.error('Local dashboard API proxy error:', err)
                res.statusCode = 502
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: err instanceof Error ? err.message : 'Error communicating with Google Sheets.' }))
              }
            }

            next()
          })
        },
      },
    ],
  }
})
