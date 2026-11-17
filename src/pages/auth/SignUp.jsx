import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { nextPath } from '../../auth/nextPath'
import { hotelTypes } from '../../content'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { ErrorBox } from '../../components/ui/States'
import AuthCard from './AuthCard'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { search } = useLocation()
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [types, setTypes] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const fe = error?.fields ?? {}

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signUp({
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email.trim(),
        password: f.password,
        phone: f.phone.replace(/[\s-]/g, '') || undefined,
        preferredTypes: types,
      })
      navigate(nextPath(search), { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Your account keeps your bookings, saved stays and preferences together.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" required autoComplete="given-name" value={f.firstName} onChange={set('firstName')} error={fe.firstName} />
          <Input label="Last name" required autoComplete="family-name" value={f.lastName} onChange={set('lastName')} error={fe.lastName} />
        </div>
        <Input label="Email address" type="email" required autoComplete="email" value={f.email} onChange={set('email')} error={fe.email} />
        <Input label="Password" type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} error={fe.password} hint="At least 8 characters" />
        <Input label="Phone (for M-Pesa, optional)" inputMode="tel" placeholder="255712345678" value={f.phone} onChange={set('phone')} error={fe.phone} />
        <div>
          <p className="mb-2 text-sm font-semibold">What do you like to stay in?</p>
          <div className="flex flex-wrap gap-2">
            {hotelTypes.map((t) => {
              const on = types.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypes(on ? types.filter((x) => x !== t) : [...types, t])}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${on ? 'bg-primary text-white' : 'bg-field'}`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>
        <ErrorBox error={error?.code === 'validation_failed' ? null : error} />
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          Create account
        </Button>
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to={`/signin${search}`} className="font-bold text-primary">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
