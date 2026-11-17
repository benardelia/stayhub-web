// Booking detail + front-desk actions (check in/out, cancel, refund), shown in a modal.
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cancelBooking, checkIn, checkOut, refundBooking } from '../../api/admin'
import { useHotelCtx } from '../../components/admin/HotelContext'
import { paymentMethods } from '../../content'
import { today } from '../../lib/dates'
import { fmtDate, fmtDateTime, fullName, guests, plural, tsh } from '../../lib/format'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Row } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import PromptModal from '../../components/ui/PromptModal'
import { ErrorBox } from '../../components/ui/States'

export default function BookingModal({ booking: b, onClose }) {
  const { hotelId, isAdmin } = useHotelCtx()
  const qc = useQueryClient()
  const [busy, setBusy] = useState('')
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState(null) // 'cancel' | 'refund'

  const done = () => {
    qc.invalidateQueries({ queryKey: ['admin-bookings', hotelId] })
    qc.invalidateQueries({ queryKey: ['dashboard', hotelId] })
    onClose()
  }
  const run = async (name, fn) => {
    setBusy(name)
    setError(null)
    try {
      await fn()
      done()
    } catch (e) {
      setError(e)
    } finally {
      setBusy('')
    }
  }

  if (!b) return null
  return (
    <>
      <Modal open={!!b && !prompt} onClose={onClose} title={`Booking ${b.ref}`}>
        <div className="mb-3 flex items-center gap-2">
          <StatusBadge status={b.status} />
          <span className="text-xs text-muted">Booked {fmtDateTime(b.createdAt)}</span>
        </div>
        <Row label="Guest" value={fullName(b.guest)} />
        <Row label="Email" value={b.guest?.email} />
        {b.guest?.phone && <Row label="Phone" value={b.guest.phone} />}
        <Row label="Room" value={b.room} />
        <Row label="Stay" value={`${fmtDate(b.checkIn)} – ${fmtDate(b.checkOut)} (${plural(b.nights, 'night')})`} />
        <Row label="Guests" value={guests(b.adults, b.children)} />
        <Row label="Total" value={tsh(b.total)} />
        {b.paidWith && <Row label="Paid with" value={paymentMethods[b.paidWith]?.label ?? b.paidWith} />}
        {b.checkedInAt && <Row label="Checked in" value={fmtDateTime(b.checkedInAt)} />}
        {b.checkedOutAt && <Row label="Checked out" value={fmtDateTime(b.checkedOutAt)} />}
        {b.cancellationReason && <Row label="Cancellation" value={b.cancellationReason} />}

        <ErrorBox error={error} className="mt-4" />
        <div className="mt-5 flex flex-wrap gap-2">
          {b.status === 'confirmed' && b.checkIn <= today() && (
            <Button loading={busy === 'in'} onClick={() => run('in', () => checkIn(hotelId, b.ref))}>
              Check in
            </Button>
          )}
          {b.status === 'checked_in' && (
            <Button loading={busy === 'out'} onClick={() => run('out', () => checkOut(hotelId, b.ref))}>
              Check out
            </Button>
          )}
          {isAdmin && (b.status === 'confirmed' || b.status === 'pending_payment') && (
            <Button variant="danger-outline" onClick={() => setPrompt('cancel')}>
              Cancel booking
            </Button>
          )}
          {isAdmin && b.paidWith && (
            <Button variant="outline" onClick={() => setPrompt('refund')}>
              Refund
            </Button>
          )}
        </div>
      </Modal>
      <PromptModal
        open={prompt === 'cancel'}
        onClose={() => setPrompt(null)}
        title={`Cancel ${b.ref}?`}
        message="Cancelling does not refund the guest — issue a refund separately if one is due."
        confirmLabel="Cancel booking"
        danger
        askReason
        onConfirm={({ reason }) => cancelBooking(hotelId, b.ref, reason).then(done)}
      />
      <PromptModal
        open={prompt === 'refund'}
        onClose={() => setPrompt(null)}
        title={`Refund ${b.ref}`}
        confirmLabel="Refund"
        askAmount
        amountHint="Leave empty to refund everything that is still refundable."
        askReason
        onConfirm={({ reason, amount }) => refundBooking(hotelId, b.ref, { reason, amount }).then(done)}
      />
    </>
  )
}
