import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelBooking, getBooking, getBookingPayments, reviewBooking } from '../../api/guest'
import { paymentMethods } from '../../content'
import { fmtDate, fmtDateTime, guests, plural, tsh } from '../../lib/format'
import PayPanel from '../../components/site/PayPanel'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card, { Row } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Field'
import PromptModal from '../../components/ui/PromptModal'
import { PageSpinner } from '../../components/ui/Spinner'
import Stars from '../../components/ui/Stars'
import { ErrorBox } from '../../components/ui/States'

export default function BookingDetail() {
  const { ref } = useParams()
  const qc = useQueryClient()
  const booking = useQuery({ queryKey: ['booking', ref], queryFn: () => getBooking(ref) })
  const payments = useQuery({ queryKey: ['booking-payments', ref], queryFn: () => getBookingPayments(ref) })
  const [cancelling, setCancelling] = useState(false)

  if (booking.isPending) return <PageSpinner />
  if (booking.error) return <ErrorBox error={booking.error} />
  const b = booking.data
  const h = b.hotel
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['booking', ref] })
    qc.invalidateQueries({ queryKey: ['my-bookings'] })
  }
  const canCancel = b.status === 'pending_payment' || b.status === 'confirmed'

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="relative aspect-[16/7] overflow-hidden rounded-3xl bg-field">
          {h?.img && <img src={h.img} alt="" className="size-full object-cover" />}
          <div className="absolute left-4 top-4">
            <StatusBadge status={b.status} />
          </div>
        </div>
        <div>
          <Link to={`/hotels/${h?.slug || b.hotelId}`} className="text-2xl font-bold tracking-tight hover:text-primary">
            {h?.name}
          </Link>
          <p className="mt-1 text-muted">{h?.place}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs font-semibold text-muted">Check in</p>
            <p className="mt-1 font-bold">{fmtDate(b.checkIn)}</p>
            <p className="text-xs text-muted">From {h?.checkInTime}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-muted">Check out</p>
            <p className="mt-1 font-bold">{fmtDate(b.checkOut)}</p>
            <p className="text-xs text-muted">Until {h?.checkOutTime}</p>
          </Card>
        </div>

        <Card>
          <Row label="Booking reference" value={b.ref} />
          <Row label="Room" value={b.room} />
          <Row label="Guests" value={guests(b.adults, b.children)} />
          <Row label="Length of stay" value={plural(b.nights, 'night')} />
          {b.cancellationReason && <Row label="Cancellation reason" value={b.cancellationReason} />}
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Price</h2>
          <Row label={`Subtotal (${plural(b.nights, 'night')})`} value={tsh(b.subtotal)} />
          <Row label="Taxes & fees" value={tsh(b.taxesFees)} />
          <div className="my-2 border-t border-line" />
          <Row bold label={b.status === 'pending_payment' ? 'Total to pay' : 'Total'} value={tsh(b.total)} />
          {b.paidWith && <Row label="Paid with" value={paymentMethods[b.paidWith]?.label ?? b.paidWith} />}
        </Card>

        {payments.data?.length > 0 && (
          <Card>
            <h2 className="mb-2 font-bold">Payments</h2>
            {payments.data.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-line py-2.5 text-sm last:border-0">
                <span>
                  {paymentMethods[p.method]?.label ?? p.method} · {fmtDateTime(p.createdAt)}
                  {p.failureReason && <span className="block text-xs text-danger">{p.failureReason}</span>}
                </span>
                <span className="flex items-center gap-3">
                  <b>{tsh(p.amount)}</b>
                  <StatusBadge status={p.status} />
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {b.status === 'pending_payment' && <PayPanel booking={b} />}
        {b.status === 'checked_out' && <ReviewForm booking={b} />}
        {canCancel && (
          <Button variant="danger-outline" className="w-full" onClick={() => setCancelling(true)}>
            Cancel booking
          </Button>
        )}
      </aside>

      <PromptModal
        open={cancelling}
        onClose={() => setCancelling(false)}
        title="Cancel this booking?"
        message={b.status === 'confirmed' ? 'If you have paid, the hotel issues any refund that is due.' : 'The room hold will be released.'}
        confirmLabel="Cancel booking"
        danger
        askReason
        onConfirm={({ reason }) => cancelBooking(b.ref, reason).then(refresh)}
      />
    </div>
  )
}

function ReviewForm({ booking }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [state, setState] = useState({ busy: false, error: null, done: false })

  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, error: null, done: false })
    try {
      await reviewBooking(booking.ref, rating, comment.trim())
      setState({ busy: false, error: null, done: true })
    } catch (error) {
      setState({ busy: false, error, done: false })
    }
  }

  if (state.done) return <Card className="text-sm">Thanks — your review has been posted.</Card>
  return (
    <Card>
      <h2 className="font-bold">How was your stay?</h2>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <Stars value={rating} onChange={setRating} size="text-2xl" />
        <Textarea rows={3} placeholder="Tell other guests about it" required value={comment} onChange={(e) => setComment(e.target.value)} />
        <ErrorBox error={state.error} />
        <Button type="submit" className="w-full" loading={state.busy}>
          Post review
        </Button>
      </form>
    </Card>
  )
}
