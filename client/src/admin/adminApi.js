/**
 * adminApi.js
 * Shared fetch utility for all admin pages.
 *
 * - Attaches the Bearer token from localStorage automatically
 * - On 401 (invalid / expired token) it clears the stored token and
 *   redirects to /admin/login with a ?reason= query so the login page
 *   can show a helpful message instead of a blank error
 */

export { API_BASE_URL } from '../config/api.js'

const ADMIN_LOGIN_PATH = '/control-panel-7x9/login'

/**
 * Check whether the stored JWT is already expired client-side
 * (without making a network call).  Returns true if expired or unparseable.
 */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp is in seconds; Date.now() is in ms
    return payload.exp * 1000 < Date.now()
  } catch {
    return true // treat unparseable tokens as expired
  }
}

/**
 * Redirect to login, wiping the stale token and passing a reason so the
 * login page can surface a helpful message.
 */
function redirectToLogin(reason = 'expired') {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  // Avoid redirect loops if we're already on the login page
  if (!window.location.pathname.includes(ADMIN_LOGIN_PATH)) {
    window.location.href = `${ADMIN_LOGIN_PATH}?reason=${reason}`
  }
}

/**
 * Drop-in replacement for fetch() for admin API calls.
 *
 * Usage:
 *   const data = await adminFetch('/themes/romantic', {
 *     method: 'PATCH',
 *     body: JSON.stringify(payload),
 *   })
 *   // data is already parsed JSON; throws on non-2xx or API error
 */
export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem('adminToken')

  // Pre-flight expiry check — catches stale tokens before wasting a round-trip
  if (!token || isTokenExpired(token)) {
    redirectToLogin('expired')
    // Return a promise that never resolves so the calling code doesn't continue
    return new Promise(() => {})
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const data = await res.json()

  // Server said token is invalid / expired → redirect immediately
  if (res.status === 401) {
    redirectToLogin('expired')
    return new Promise(() => {})
  }

  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }

  return data
}