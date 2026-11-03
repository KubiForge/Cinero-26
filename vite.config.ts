
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const REGISTRATION_OPEN_TIME = new Date(
  '2026-10-27T00:00:00+05:30'
).getTime()

const REGISTRATION_CLOSE_TIME = new Date(
  '2026-11-08T00:00:00+05:30'
).getTime()

const MAX_REQUEST_SIZE = 10 * 1024 * 1024

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function sendJson(res: any, statusCode: number, data: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

async function readJsonResponse(response: Response, serviceName: string) {
  const text = await response.text()

  if (!text.trim()) {
    throw new Error(`${serviceName} returned an empty response.`)
  }

  try {
    const data: unknown = JSON.parse(text)

    if (!isRecord(data)) {
      throw new Error(`${serviceName} returned an invalid JSON object.`)
    }

    return data
  } catch (error) {
    const preview = text.slice(0, 500)

    console.error(`${serviceName} non-JSON response:`, {
      httpStatus: response.status,
      contentType: response.headers.get('content-type'),
      finalUrl: response.url,
      preview,
    })

    if (text.trimStart().startsWith('<!DOCTYPE') ||
        text.trimStart().startsWith('<html') ||
        text.trimStart().startsWith('<')) {
      throw new Error(
        `${serviceName} returned an HTML page instead of JSON. ` +
        `Check the Apps Script deployment URL, access permissions, ` +
        `and whether the latest code has been deployed. ` +
        `HTTP ${response.status}.`
      )
    }

    throw new Error(
      `${serviceName} returned invalid JSON. HTTP ${response.status}.`
    )
  }
}

function validateGoogleScriptUrl(value: string | undefined) {
  if (!value) {
    throw new Error(
      'GOOGLE_APPS_SCRIPT_CREW_URL is missing from .env.'
    )
  }

  let url: URL

  try {
    url = new URL(value.trim())
  } catch {
    throw new Error('The Crew Apps Script URL is invalid.')
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'script.google.com' ||
    !/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)
  ) {
    throw new Error(
      'Invalid Crew Apps Script URL. Use the deployed Web App URL ending in /exec.'
    )
  }

  return url.toString()
}

async function readRequestBody(req: any, limit: number) {
  return new Promise<string>((resolve, reject) => {
    let body = ''
    let size = 0

    req.on('data', (chunk: Buffer | string) => {
      const value = typeof chunk === 'string'
        ? chunk
        : chunk.toString()

      size += Buffer.byteLength(value)

      if (size > limit) {
        reject(new Error('REQUEST_TOO_LARGE'))
        req.destroy()
        return
      }

      body += value
    })

    req.on('end', () => resolve(body))

    req.on('error', reject)
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),

      {
        name: 'local-api-registration',

        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {

            // =================================================
            // CREW AUTHENTICATION API
            // =================================================

            if (req.url?.split('?')[0] === '/api/crew') {

              if (req.method !== 'POST') {
                return sendJson(res, 405, {
                  success: false,
                  message: 'Method not allowed.',
                })
              }

              try {
                const body = await readRequestBody(
                  req,
                  8192
                )

                let payload: unknown

                try {
                  payload = body ? JSON.parse(body) : null
                } catch {
                  return sendJson(res, 400, {
                    success: false,
                    message: 'Request body is not valid JSON.',
                  })
                }

                if (
                  !isRecord(payload) ||
                  typeof payload.action !== 'string' ||
                  ![
                    'login',
                    'validate',
                    'dashboard',
                    'logout',
                  ].includes(payload.action)
                ) {
                  return sendJson(res, 400, {
                    success: false,
                    message: 'Unknown crew request.',
                  })
                }

                // ---------------------------------------------
                // VALIDATE LOGIN REQUEST
                // ---------------------------------------------

                let upstreamPayload: Record<string, string>

                if (payload.action === 'login') {

                  if (
                    typeof payload.username !== 'string' ||
                    typeof payload.password !== 'string' ||
                    !payload.username.trim() ||
                    !payload.password ||
                    payload.username.length > 128 ||
                    payload.password.length > 256
                  ) {
                    return sendJson(res, 400, {
                      success: false,
                      message: 'Enter a valid username and password.',
                    })
                  }

                  upstreamPayload = {
                    action: 'login',
                    username: payload.username.trim(),
                    password: payload.password,
                  }

                } else {

                  if (
                    typeof payload.token !== 'string' ||
                    !payload.token ||
                    payload.token.length > 256
                  ) {
                    return sendJson(res, 401, {
                      success: false,
                      message: 'Your session has expired. Please sign in again.',
                    })
                  }

                  upstreamPayload = {
                    action: payload.action,
                    token: payload.token,
                  }
                }

                // ---------------------------------------------
                // GET CREW APPS SCRIPT URL
                // ---------------------------------------------

                let endpoint: string

                try {
                  endpoint = validateGoogleScriptUrl(
                    env.GOOGLE_APPS_SCRIPT_CREW_URL
                  )
                } catch (error) {
                  return sendJson(res, 500, {
                    success: false,
                    message: error instanceof Error
                      ? error.message
                      : 'Crew service is not configured.',
                  })
                }

                // ---------------------------------------------
                // CONNECT TO GOOGLE APPS SCRIPT
                // ---------------------------------------------

                console.log(
                  `[Crew API] Sending ${payload.action} request to Google Apps Script.`
                )

                const response = await fetch(endpoint, {
                  method: 'POST',

                  headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                    Accept: 'application/json',
                  },

                  body: JSON.stringify(upstreamPayload),

                  redirect: 'follow',

                  signal: AbortSignal.timeout(30000),
                })

                // IMPORTANT:
                // Read response as text first.
                // Google may return HTML instead of JSON.

                const result = await readJsonResponse(
                  response,
                  'Crew Google Apps Script'
                )

                console.log('[Crew API] Upstream response:', {
                  action: payload.action,
                  httpStatus: response.status,
                  success: result.success,
                })

                // ---------------------------------------------
                // HANDLE FAILED RESPONSE
                // ---------------------------------------------

                if (result.success !== true) {

                  const message =
                    typeof result.message === 'string'
                      ? result.message
                      : 'The crew service could not complete the request.'

                  const upstreamStatus =
                    typeof result.statusCode === 'number'
                      ? result.statusCode
                      : payload.action === 'login'
                        ? 401
                        : 400

                  const safeStatus = [
                    400,
                    401,
                    403,
                    429,
                    503,
                  ].includes(upstreamStatus)
                    ? upstreamStatus
                    : 502

                  return sendJson(res, safeStatus, {
                    success: false,
                    message,
                  })
                }

                // ---------------------------------------------
                // LOGIN RESPONSE
                // ---------------------------------------------

                if (payload.action === 'login') {

                  if (
                    typeof result.token !== 'string' ||
                    typeof result.expiresIn !== 'number'
                  ) {
                    throw new Error(
                      'Invalid login response from Crew Apps Script.'
                    )
                  }

                  const user = isRecord(result.user)
                    ? result.user
                    : undefined

                  return sendJson(res, 200, {
                    success: true,
                    token: result.token,
                    expiresIn: result.expiresIn,
                    ...(user ? { user } : {}),
                  })
                }

                // ---------------------------------------------
                // DASHBOARD RESPONSE
                // ---------------------------------------------

                if (payload.action === 'dashboard') {

                  if (!isRecord(result.dashboard)) {
                    throw new Error(
                      'Invalid dashboard response from Crew Apps Script.'
                    )
                  }

                  return sendJson(res, 200, {
                    success: true,
                    dashboard: result.dashboard,
                  })
                }

                // ---------------------------------------------
                // VALIDATE / LOGOUT RESPONSE
                // ---------------------------------------------

                return sendJson(res, 200, {
                  success: true,
                  message: result.message || 'Request successful.',
                  ...(isRecord(result.user)
                    ? { user: result.user }
                    : {}),
                })

              } catch (error) {

                if (error instanceof Error &&
                    error.message === 'REQUEST_TOO_LARGE') {
                  return sendJson(res, 413, {
                    success: false,
                    message: 'Request body is too large.',
                  })
                }

                console.error('Local crew API error:', error)

                return sendJson(res, 502, {
                  success: false,
                  message: error instanceof Error
                    ? error.message
                    : 'Unable to communicate with the Crew service.',
                })
              }
            }


            // =================================================
            // REGISTRATION API
            // EXISTING REGISTRATION WEBHOOK PRESERVED
            // =================================================

            if (req.url?.split('?')[0] === '/api/registration') {

              if (req.method !== 'POST') {
                return sendJson(res, 405, {
                  success: false,
                  message: 'Method not allowed.',
                })
              }

              if (Date.now() < REGISTRATION_OPEN_TIME) {
                return sendJson(res, 403, {
                  success: false,
                  message:
                    'Registration has not started yet. Registration opens on 27 October 2026 at 12:00 AM Sri Lanka time.',
                })
              }

              if (Date.now() >= REGISTRATION_CLOSE_TIME) {
                return sendJson(res, 403, {
                  success: false,
                  message: 'Registration closed. The deadline has passed.',
                })
              }

              try {

                const body = await readRequestBody(
                  req,
                  MAX_REQUEST_SIZE
                )

                const webhookUrl = env.GOOGLE_SHEET_WEBHOOK_URL

                if (!webhookUrl) {
                  return sendJson(res, 500, {
                    success: false,
                    message:
                      'GOOGLE_SHEET_WEBHOOK_URL is not configured in .env.',
                  })
                }

                // Keep the original registration webhook unchanged.

                const googleRes = await fetch(webhookUrl, {
                  method: 'POST',

                  headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                    Accept: 'application/json',
                  },

                  body,

                  redirect: 'follow',

                  signal: AbortSignal.timeout(30000),
                })

                const result = await readJsonResponse(
                  googleRes,
                  'Registration Google Apps Script'
                )

                const isSuccess =
                  result.success === true ||
                  result.status === 'success'

                if (!isSuccess) {
                  return sendJson(res, 502, {
                    success: false,
                    message:
                      typeof result.message === 'string'
                        ? result.message
                        : 'Google Sheets did not confirm the registration.',
                  })
                }

                return sendJson(res, 200, {
                  success: true,

                  message:
                    typeof result.message === 'string'
                      ? result.message
                      : 'Registration saved successfully.',

                  referenceId:
                    typeof result.referenceId === 'string'
                      ? result.referenceId
                      : undefined,
                })

              } catch (error) {

                if (error instanceof Error &&
                    error.message === 'REQUEST_TOO_LARGE') {
                  return sendJson(res, 413, {
                    success: false,
                    message: 'Registration request is too large.',
                  })
                }

                console.error(
                  'Local registration API proxy error:',
                  error
                )

                return sendJson(res, 502, {
                  success: false,
                  message: error instanceof Error
                    ? error.message
                    : 'Error communicating with Google Sheets.',
                })
              }
            }

            next()
          })
        },
      },
    ],
  }
})
