import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMe, deletePaymentMethod, getMe, getPaymentMethods, makeDefaultPaymentMethod, updateMe } from '../../api/guest'
import { useAuth } from '../../auth/useAuth'
import { hotelTypes, paymentMethods, roles } from '../../content'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Input } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import PromptModal from '../../components/ui/PromptModal'
import { PageSpinner } from '../../components/ui/Spinner'
import { ErrorBox } from '../../components/ui/States'

export default function Profile() {
  const me = useQuery({ queryKey: ['me'], queryFn: getMe })
  if (me.isPending) return <PageSpinner />
  if (me.error) return <ErrorBox error={me.error} />
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" subtitle={`${me.data.email} · ${roles[me.data.role] ?? me.data.role}`} />
      <ProfileForm user={me.data} />
      <SavedMethods />
      <DangerZone />
    </div>
  )
}

function ProfileForm({ user }) {
  const { setUser } = useAuth()
  const qc = useQueryClient()
  const [f, setF] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
    homeLocation: user.homeLocation ?? '',
    preferredTypes: user.preferredTypes ?? [],
  })
  const [state, setState] = useState({ busy: false, error: null, saved: false })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const fe = state.error?.fields ?? {}

  const save = async (e) => {
    e.preventDefault()
    setState({ busy: true, error: null, saved: false })
    try {
      const u = await updateMe({ ...f, phone: f.phone.replace(/[\s-]/g, '') || null, homeLocation: f.homeLocation || null })
      setUser(u)
      qc.setQueryData(['me'], u)
      setState({ busy: false, error: null, saved: true })
    } catch (error) {
      setState({ busy: false, error, saved: false })
    }
  }

  return (
    <Card>
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="First name" value={f.firstName} onChange={set('firstName')} error={fe.firstName} />
          <Input label="Last name" value={f.lastName} onChange={set('lastName')} error={fe.lastName} />
          <Input label="Phone (M-Pesa)" inputMode="tel" placeholder="255712345678" value={f.phone} onChange={set('phone')} error={fe.phone} />
          <Input label="Home location" value={f.homeLocation} onChange={set('homeLocation')} error={fe.homeLocation} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Favourite kinds of stay</p>
          <div className="flex flex-wrap gap-2">
            {hotelTypes.map((t) => {
              const on = f.preferredTypes.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setF({ ...f, preferredTypes: on ? f.preferredTypes.filter((x) => x !== t) : [...f.preferredTypes, t] })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${on ? 'bg-primary text-white' : 'bg-field'}`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>
        <ErrorBox error={state.error?.code === 'validation_failed' ? null : state.error} />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={state.busy}>
            Save changes
          </Button>
          {state.saved && <span className="text-sm text-success">Saved</span>}
        </div>
      </form>
    </Card>
  )
}

function SavedMethods() {
  const qc = useQueryClient()
  const methods = useQuery({ queryKey: ['my-payment-methods'], queryFn: getPaymentMethods })
  const [error, setError] = useState(null)
  const act = (fn) => fn().then(() => qc.invalidateQueries({ queryKey: ['my-payment-methods'] }), setError)

  if (!methods.data?.length) return null
  return (
    <Card>
      <h2 className="mb-3 font-bold">Saved payment methods</h2>
      <ErrorBox error={error} className="mb-3" />
      {methods.data.map((m) => (
        <div key={m.id} className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0">
          <span>
            <b>{paymentMethods[m.method]?.label ?? m.method}</b>{' '}
            {m.last4 ? `•••• ${m.last4}` : m.phone}
            {m.isDefault && (
              <Badge tone="info" className="ml-2">
                Default
              </Badge>
            )}
          </span>
          <span className="flex gap-2">
            {!m.isDefault && (
              <Button size="sm" variant="ghost" onClick={() => act(() => makeDefaultPaymentMethod(m.id))}>
                Make default
              </Button>
            )}
            <Button size="sm" variant="danger-outline" onClick={() => act(() => deletePaymentMethod(m.id))}>
              Remove
            </Button>
          </span>
        </div>
      ))}
    </Card>
  )
}

function DangerZone() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  return (
    <Card className="border-danger/30">
      <h2 className="font-bold">Delete account</h2>
      <p className="mt-1 text-sm text-muted">Your profile is anonymised and you are signed out everywhere. Past bookings stay with the hotels for their records.</p>
      <Button variant="danger-outline" className="mt-4" onClick={() => setOpen(true)}>
        Delete my account
      </Button>
      <PromptModal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account?"
        message="This cannot be undone."
        confirmLabel="Delete account"
        danger
        onConfirm={async () => {
          await deleteMe()
          await signOut()
          navigate('/', { replace: true })
        }}
      />
    </Card>
  )
}
