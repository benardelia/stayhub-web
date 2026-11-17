// The signed-in session: { accessToken, refreshToken, expiresAt, user }. Kept in localStorage so it survives
// reloads and is shared by every tab; listeners hear about changes from this tab and from others.

const KEY = 'estantly.session'
const listeners = new Set()

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

let current = read()

const emit = () => listeners.forEach((l) => l(current))

export const getSession = () => current

export function setSession(next) {
  current = next
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next))
    else localStorage.removeItem(KEY)
  } catch {
    // Private mode / storage blocked: the session still lives in memory for this tab.
  }
  emit()
}

/** Re-reads storage (another tab may have rotated the tokens). */
export function reloadSession() {
  current = read()
  return current
}

/** Stores an AuthResult from sign-in, sign-up or refresh. */
export const saveAuthResult = (r) =>
  setSession({
    accessToken: r.accessToken,
    refreshToken: r.refreshToken,
    expiresAt: Date.now() + r.expiresIn * 1000,
    user: r.user,
  })

export const updateSessionUser = (user) => current && setSession({ ...current, user })

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    current = read()
    emit()
  }
})
