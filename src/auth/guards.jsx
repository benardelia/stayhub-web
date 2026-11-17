import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

/** Sends signed-out visitors to /signin and back here afterwards. */
export function RequireAuth() {
  const { signedIn } = useAuth()
  const loc = useLocation()
  if (!signedIn) return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  return <Outlet />
}

export function RequirePlatformAdmin() {
  const { signedIn, isPlatformAdmin } = useAuth()
  const loc = useLocation()
  if (!signedIn) return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname)}`} replace />
  if (!isPlatformAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
