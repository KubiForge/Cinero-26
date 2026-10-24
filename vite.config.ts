import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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

                  const result = (await googleRes.json()) as any
                  const isSuccess =
                    result && (result.success === true || result.status === 'success')

                  if (!isSuccess) {
                    throw new Error(result?.message || 'Google Sheets did not confirm save.')
                  }

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(
                    JSON.stringify({
                      success: true,
                      message: result?.message || 'Registration saved successfully.',
                      referenceId: result?.referenceId,
                    })
                  )
                } catch (err: any) {
                  console.error('Local registration API proxy error:', err)
                  res.statusCode = 502
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(
                    JSON.stringify({
                      success: false,
                      message: err.message || 'Error communicating with Google Sheets',
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

