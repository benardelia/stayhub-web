// Runtime configuration. Everything that differs between environments comes from Vite env variables.

/** API origin without a trailing slash; empty means "same origin" (dev proxy or reverse proxy). */
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

/** Base path of the REST API. */
export const API_BASE = `${API_URL}/api/v1`
