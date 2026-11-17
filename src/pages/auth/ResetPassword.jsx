import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { resetPassword } from '../../api/auth'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { ErrorBox } from '../../components/ui/States'
import AuthCard from './AuthCard'

export default function ResetPassword() {
  const [sp] = useSearchParams()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await resetPassword(sp.get('token') ?? '', password)
      setDone(true)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Choose a new password">
      {done ? (
        <p className="text-sm">
          Your password has been changed. <Link to="/signin" className="font-bold text-primary">Sign in</Link>
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="New password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error?.fields?.password} />
          <ErrorBox error={error?.code === 'validation_failed' ? null : error} />
          <Button type="submit" size="lg" className="w-full" loading={busy}>
            Save password
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
