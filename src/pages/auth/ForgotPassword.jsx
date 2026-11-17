import { useState } from 'react'
import { Link } from 'react-router'
import { forgotPassword } from '../../api/auth'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { ErrorBox } from '../../components/ui/States'
import AuthCard from './AuthCard'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      {sent ? (
        <p className="text-sm">
          If an account exists for <b>{email}</b>, a reset link is on its way. <Link to="/signin" className="font-bold text-primary">Back to sign in</Link>
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <ErrorBox error={error} />
          <Button type="submit" size="lg" className="w-full" loading={busy}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
