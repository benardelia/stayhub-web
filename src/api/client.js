// HTTP client for the Estantly REST API (/api/v1). Adds the bearer token, refreshes it when it expires,
// and turns error responses ({"error":{code,message,details}}) into ApiError.

import { API_BASE } from '../config'
import { getSession, reloadSession, saveAuthResult, setSession } from './session'

export class ApiError extends Error {
  constructor(status, body) {
    const e = body?.error ?? {}
    super(e.message || `Request failed (${status})`)
    this.status = status
    this.code = e.code || 'http_error'
    this.details = e.details || {}
  }

  /** Field errors from a validation_failed response: { field: "message" }. */
  get fields() {
    return this.code === 'validation_failed' ? this.details : {}
  }
}

/** Builds "?a=1&b=x" from an object, skipping empty values; arrays repeat the key. */
export function qs(params = {}) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, x))
    else sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ---- token refresh -------------------------------------------------------------------------------
// Refresh tokens rotate and a reused one revokes the whole session, so only one refresh may run at a
// time: one promise per tab, and a Web Lock across tabs. Inside the lock we re-read storage — if another
// tab already rotated the token we just use its result.

let refreshing = null

async function doRefresh(staleToken) {
  const s = reloadSession()
  if (!s) return null
  if (s.refreshToken !== staleToken && s.expiresAt - Date.now() > 30_000) return s
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: s.refreshToken }),
  })
  if (!res.ok) {
    setSession(null)
    return null
  }
  saveAuthResult(await res.json())
  return getSession()
}

export function refreshSession() {
  const stale = getSession()?.refreshToken
  if (!stale) return Promise.resolve(null)
  if (!refreshing) {
    const run = () => doRefresh(stale)
    refreshing = (navigator.locks ? navigator.locks.request('estantly-refresh', run) : run())
      .catch(() => null)
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

async function accessToken() {
  let s = getSession()
  if (!s) return null
  if (s.expiresAt - Date.now() < 30_000) s = await refreshSession()
  return s?.accessToken ?? null
}

// ---- requests -------------------------------------------------------------------------------------

/**
 * request('/hotels', { query, body, method, idempotencyKey, form, auth })
 * - body is sent as JSON; form (FormData) as multipart.
 * - auth: true sends the token when signed in (default); false never does.
 */
export async function request(path, { method = 'GET', query, body, form, idempotencyKey, auth = true, signal } = {}) {
  const send = async (token) => {
    const headers = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
    return fetch(`${API_BASE}${path}${qs(query)}`, {
      method,
      headers,
      signal,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  }

  const token = auth ? await accessToken() : null
  let res = await send(token)
  if (res.status === 401 && token) {
    const s = await refreshSession()
    if (s) res = await send(s.accessToken)
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

/** A fresh Idempotency-Key for POST /bookings and /payments. */
export const newIdempotencyKey = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
