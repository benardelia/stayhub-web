import { useState } from 'react'
import { getBookings } from '../../api/admin'
import { useHotelCtx } from '../../components/admin/HotelContext'
import { bookingStatuses, statuses } from '../../content'
import { usePaged } from '../../lib/query'
import { plural } from '../../lib/format'
import BookingModal from './BookingActions'
import { bookingColumns } from './columns'
import { Input, Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox, LoadMore } from '../../components/ui/States'

export default function Bookings() {
  const { hotelId } = useHotelCtx()
  const [filters, setFilters] = useState({ status: '', from: '', to: '', q: '' })
  const [open, setOpen] = useState(null)
  const list = usePaged(['admin-bookings', hotelId], (p) => getBookings(hotelId, p), { ...filters, limit: 25 })
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  return (
    <>
      <PageHeader title="Bookings" subtitle={list.total != null ? plural(list.total, 'booking') : ' '} />
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <Input placeholder="Ref, guest name or email" value={filters.q} onChange={set('q')} />
        <Select value={filters.status} onChange={set('status')} placeholder="All statuses" options={bookingStatuses.map((s) => ({ value: s, label: statuses[s][0] }))} />
        <Input type="date" value={filters.from} onChange={set('from')} title="Stays from" />
        <Input type="date" value={filters.to} onChange={set('to')} title="Stays until" />
      </div>
      <ErrorBox error={list.error} />
      {list.isPending ? <PageSpinner /> : <Table columns={bookingColumns} rows={list.items} onRowClick={setOpen} empty="No bookings match." />}
      <LoadMore query={list} />
      <BookingModal booking={open} onClose={() => setOpen(null)} />
    </>
  )
}
