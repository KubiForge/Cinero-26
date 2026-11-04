import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const REGISTRATION_OPEN_TIME = new Date('2026-10-27T00:00:00+05:30').getTime()
const REGISTRATION_CLOSE_TIME = new Date('2026-11-08T00:00:00+05:30').getTime()

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

                if (!crewUsername || !crewPasswordHash) {
                  res.statusCode = 503
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({
                    success: false,
                    message: 'Auth not configured. Add CREW_USERNAME and CREW_PASSWORD_HASH to your .env.local file or Vercel environment variables.',
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

                  const { createHash: ch2 } = await import('crypto')
                  const token = ch2('sha256').update(`${crewUsername}:${Date.now()}`).digest('hex')
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
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

            next()
          })
        },
      },
    ],
  }
})
