// Auth endpoints. Successful sign-in/up store the session; components read it through AuthProvider.
import { request } from './client'
import { getSession, saveAuthResult, setSession } from './session'

const signedIn = (r) => {
  saveAuthResult(r)
  return r.user
}

export const signIn = (email, password) =>
  request('/auth/signin', { method: 'POST', auth: false, body: { email, password } }).then(signedIn)

/** input: { firstName, lastName, email, password, phone?, location?, preferredTypes? } */
export const signUp = (input) =>
  request('/auth/signup', { method: 'POST', auth: false, body: { preferredTypes: [], ...input } }).then(signedIn)

export async function signOut() {
  const refreshToken = getSession()?.refreshToken
  setSession(null)
  if (refreshToken) {
    await request('/auth/signout', { method: 'POST', auth: false, body: { refreshToken } }).catch(() => {})
  }
}

export const forgotPassword = (email) =>
  request('/auth/password/forgot', { method: 'POST', auth: false, body: { email } })

export const resetPassword = (token, password) =>
  request('/auth/password/reset', { method: 'POST', auth: false, body: { token, password } })
