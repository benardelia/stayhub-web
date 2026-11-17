import { createContext, useContext } from 'react'

/** { user, signedIn, isPlatformAdmin, signIn, signUp, signOut, setUser } — provided by AuthProvider. */
export const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)
