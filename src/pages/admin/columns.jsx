// Table columns shared by the hotel back office and the platform admin.
import { paymentMethods } from '../../content'
import { fmtDate, fmtDateTime, fullName, tsh } from '../../lib/format'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export const bookingColumns = [
  { key: 'ref', label: 'Ref', render: (b) => <b>{b.ref}</b> },
  { key: 'guest', label: 'Guest', render: (b) => fullName(b.guest) },
  { key: 'room', label: 'Room' },
  { key: 'stay', label: 'Stay', render: (b) => `${fmtDate(b.checkIn)} – ${fmtDate(b.checkOut)}` },
  { key: 'total', label: 'Total', render: (b) => tsh(b.total), className: 'text-right' },
  { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
]

export const paymentColumns = (onRefund) => [
  { key: 'bookingRef', label: 'Booking', render: (p) => <b>{p.bookingRef}</b> },
  { key: 'method', label: 'Method', render: (p) => paymentMethods[p.method]?.label ?? p.method },
  { key: 'createdAt', label: 'Date', render: (p) => fmtDateTime(p.createdAt) },
  { key: 'amount', label: 'Amount', render: (p) => tsh(p.amount), className: 'text-right' },
  { key: 'refundedAmount', label: 'Refunded', render: (p) => (p.refundedAmount ? tsh(p.refundedAmount) : '—'), className: 'text-right' },
  { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  {
    key: 'actions',
    label: '',
    render: (p) =>
      (p.status === 'succeeded' || p.status === 'partially_refunded') && (
        <Button size="sm" variant="outline" onClick={() => onRefund(p)}>
          Refund
        </Button>
      ),
  },
]

export const refundColumns = [
  { key: 'bookingRef', label: 'Booking', render: (r) => <b>{r.bookingRef}</b> },
  { key: 'createdAt', label: 'Requested', render: (r) => fmtDateTime(r.createdAt) },
  { key: 'reason', label: 'Reason' },
  { key: 'amount', label: 'Amount', render: (r) => tsh(r.amount), className: 'text-right' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]
