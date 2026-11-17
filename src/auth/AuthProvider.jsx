import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { getMe } from '../api/guest'
import { getSession, subscribe, updateSessionUser } from '../api/session'
import { AuthCtx } from './useAuth'

export function AuthProvider({ children }) {
  const session = useSyncExternalStore(subscribe, getSession)
  const queryClient = useQueryClient()
  const signedIn = !!session

  // Refresh the stored user once per load (role or name may have changed since sign-in).
  useEffect(() => {
    if (signedIn) getMe().then(updateSessionUser).catch(() => {})
  }, [signedIn])

  const signOut = useCallback(async () => {
    await authApi.signOut()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      signedIn,
      isPlatformAdmin: session?.user?.role === 'platform_admin',
      signIn: authApi.signIn,
      signUp: authApi.signUp,
      signOut,
      setUser: updateSessionUser,
    }),
    [session, signedIn, signOut],
  )
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
