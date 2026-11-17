import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { nextPath } from '../../auth/nextPath'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { ErrorBox } from '../../components/ui/States'
import AuthCard from './AuthCard'

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { search } = useLocation()
  const [f, setF] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(f.email.trim(), f.password)
      navigate(nextPath(search), { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to see your bookings, saved stays and the hotels you manage.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email address" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={error?.fields?.email} />
        <Input label="Password" type="password" autoComplete="current-password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={error?.fields?.password} />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary">
            Forgot password?
          </Link>
        </div>
        <ErrorBox error={error?.code === 'validation_failed' ? null : error} />
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          Sign in
        </Button>
        <p className="text-center text-sm text-muted">
          New here?{' '}
          <Link to={`/signup${search}`} className="font-bold text-primary">
            Create an account
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
