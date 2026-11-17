import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../api/admin'
import { useHotelCtx } from '../../components/admin/HotelContext'
import { monthRange, today } from '../../lib/dates'
import { fmtDate, fullName, tsh } from '../../lib/format'
import BookingModal from './BookingActions'
import { Stat } from '../../components/ui/Card'
import { Input } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox } from '../../components/ui/States'
import { StatusBadge } from '../../components/ui/Badge'

export default function Dashboard() {
  const { hotelId, hotel } = useHotelCtx()
  const [range, setRange] = useState(monthRange(today()))
  const [open, setOpen] = useState(null)
  const q = useQuery({ queryKey: ['dashboard', hotelId, range], queryFn: () => getDashboard(hotelId, range) })
  const d = q.data

  const cols = [
    { key: 'ref', label: 'Ref', render: (b) => <b>{b.ref}</b> },
    { key: 'guest', label: 'Guest', render: (b) => fullName(b.guest) },
    { key: 'room', label: 'Room' },
    { key: 'dates', label: 'Stay', render: (b) => `${fmtDate(b.checkIn)} – ${fmtDate(b.checkOut)}` },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={hotel.status !== 'published' ? 'This property is not live yet — finish the profile and submit it for review.' : `${hotel.name} · ${hotel.place}`}
        actions={
          <div className="flex gap-2">
            <Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
            <Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </div>
        }
      />
      <ErrorBox error={q.error} />
      {q.isPending ? (
        <PageSpinner />
      ) : (
        d && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Occupancy" value={`${Math.round(d.occupancyRate * 100)}%`} hint={`${d.bookedRoomNights} of ${d.availableRoomNights} room-nights`} />
              <Stat label="Room revenue" value={d.roomRevenue != null ? tsh(d.roomRevenue) : '—'} />
              <Stat label="New bookings" value={d.newBookings} hint={`${d.cancellations} cancelled`} />
              <Stat label="Awaiting payment" value={d.pendingPayments} />
            </div>
            <h2 className="mb-3 mt-10 text-lg font-bold">Arrivals</h2>
            <Table columns={cols} rows={d.arrivals} onRowClick={setOpen} empty="No arrivals in this period." />
            <h2 className="mb-3 mt-10 text-lg font-bold">Departures</h2>
            <Table columns={cols} rows={d.departures} onRowClick={setOpen} empty="No departures in this period." />
          </>
        )
      )}
      <BookingModal booking={open} onClose={() => setOpen(null)} />
    </>
  )
}
