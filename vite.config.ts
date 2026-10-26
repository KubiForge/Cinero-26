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
        name: 'local-api-registration',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
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
