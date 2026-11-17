// Pays a pending_payment booking. Handles the three provider responses:
//   none      → paid (or failed) immediately
//   ussd_push → M-Pesa prompt on the phone; we poll /confirm until it settles
//   redirect  → hosted checkout (Pesapal); it sends the guest back to this booking page, where we poll again
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPaymentMethodsAvailable } from '../../api/catalog'
import { confirmPayment, getBookingPayments, startPayment } from '../../api/guest'
import { newIdempotencyKey } from '../../api/client'
import { useAuth } from '../../auth/useAuth'
import { paymentMethods } from '../../content'
import { tsh } from '../../lib/format'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { Input } from '../ui/Field'
import Spinner from '../ui/Spinner'
import { ErrorBox } from '../ui/States'

const POLL_MS = 4000
const POLL_FOR_MS = 3 * 60_000

export default function PayPanel({ booking }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const methods = useQuery({ queryKey: ['payment-methods-available'], queryFn: getPaymentMethodsAvailable, staleTime: 5 * 60_000 })
  const payments = useQuery({ queryKey: ['booking-payments', booking.ref], queryFn: () => getBookingPayments(booking.ref) })

  const [method, setMethod] = useState('')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [waiting, setWaiting] = useState(null) // { id, message }
  const key = useRef(null)
  const resumed = useRef(new Set()) // pending payments we've already started checking

  const chosen = method || methods.data?.[0] || ''

  // A payment still pending from earlier (e.g. back from Pesapal, or the page was reloaded): keep checking it.
  useEffect(() => {
    const pending = payments.data?.find((p) => p.status === 'pending')
    if (pending && !waiting && !resumed.current.has(pending.id)) {
      resumed.current.add(pending.id)
      setWaiting({ id: pending.id, message: pending.nextAction?.message || 'Checking your payment…' })
    }
  }, [payments.data, waiting])

  const settled = () => {
    setWaiting(null)
    qc.invalidateQueries({ queryKey: ['booking', booking.ref] })
    qc.invalidateQueries({ queryKey: ['booking-payments', booking.ref] })
    qc.invalidateQueries({ queryKey: ['my-bookings'] })
  }

  const settledRef = useRef(settled)
  useEffect(() => {
    settledRef.current = settled
  })
  const waitingId = waiting?.id
  const ref = booking.ref

  useEffect(() => {
    if (!waitingId) return
    const started = Date.now()
    let stop = false
    const tick = async () => {
      if (stop) return
      try {
        const p = await confirmPayment(ref, waitingId)
        if (p.status === 'succeeded') return settledRef.current()
        if (p.status === 'failed') {
          setError(new Error(p.failureReason || 'The payment was not completed.'))
          return settledRef.current()
        }
      } catch (e) {
        setError(e)
      }
      if (Date.now() - started > POLL_FOR_MS) {
        setWaiting(null)
        setError(new Error('We have not heard back about this payment yet. If you approved it, refresh in a minute.'))
        return
      }
      setTimeout(tick, POLL_MS)
    }
    const t = setTimeout(tick, POLL_MS)
    return () => {
      stop = true
      clearTimeout(t)
    }
  }, [waitingId, ref])

  const pay = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    key.current ??= newIdempotencyKey()
    try {
      const p = await startPayment(
        booking.ref,
        {
          method: chosen,
          phone: chosen === 'mpesa' ? phone.replace(/[\s-]/g, '') : undefined,
          returnUrl: `${window.location.origin}/account/bookings/${booking.ref}`,
        },
        key.current,
      )
      key.current = null
      const next = p.nextAction
      if (p.status === 'succeeded') settled()
      else if (p.status === 'failed') setError(new Error(p.failureReason || 'The payment was declined.'))
      else if (next?.type === 'redirect' && next.url) window.location.assign(next.url)
      else {
        resumed.current.add(p.id)
        setWaiting({ id: p.id, message: next?.message || 'Waiting for the payment to complete…' })
      }
    } catch (err) {
      setError(err)
      if (err.status && err.status < 500) key.current = null
    } finally {
      setBusy(false)
    }
  }

  if (waiting) {
    return (
      <Card className="flex items-start gap-4">
        <Spinner className="mt-0.5 size-6 shrink-0 text-primary" />
        <div>
          <p className="font-bold">Waiting for your payment</p>
          <p className="mt-1 text-sm text-muted">{waiting.message}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-lg font-bold">Pay {tsh(booking.total)}</h2>
      {booking.expiresAt && (
        <p className="mt-1 text-sm text-muted">
          Your room is held until {new Date(booking.expiresAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.
        </p>
      )}
      <form onSubmit={pay} className="mt-4 space-y-3">
        {(methods.data ?? []).map((m) => (
          <label
            key={m}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition ${chosen === m ? 'border-primary bg-soft' : 'border-line hover:bg-field'}`}
          >
            <input type="radio" name="method" value={m} checked={chosen === m} onChange={() => setMethod(m)} className="accent-primary" />
            <span>
              <span className="block font-semibold">{paymentMethods[m]?.label ?? m}</span>
              <span className="block text-xs text-muted">{paymentMethods[m]?.hint}</span>
            </span>
          </label>
        ))}
        {methods.data?.length === 0 && <p className="text-sm text-muted">Payments are not enabled on this server yet.</p>}
        {chosen === 'mpesa' && (
          <Input
            label="M-Pesa phone number"
            placeholder="255712345678"
            inputMode="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error?.fields?.phone}
          />
        )}
        <ErrorBox error={error} />
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!chosen}>
          {chosen === 'card' ? 'Continue to secure payment' : `Pay ${tsh(booking.total)}`}
        </Button>
      </form>
    </Card>
  )
}
