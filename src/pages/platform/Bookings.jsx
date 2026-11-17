import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getBookings, refundBooking } from '../../api/platform'
import { bookingStatuses, statuses } from '../../content'
import { plural } from '../../lib/format'
import { usePaged } from '../../lib/query'
import { bookingColumns } from '../admin/columns'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import PromptModal from '../../components/ui/PromptModal'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox, LoadMore } from '../../components/ui/States'

export default function PlatformBookings() {
  const qc = useQueryClient()
  const [f, setF] = useState({ status: '', from: '', to: '', q: '' })
  const [refund, setRefund] = useState(null)
  const list = usePaged(['platform-bookings'], getBookings, { ...f, limit: 25 })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const columns = [
    { key: 'hotel', label: 'Hotel', render: (b) => b.hotel?.name },
    ...bookingColumns,
    {
      key: 'actions',
      label: '',
      render: (b) =>
        b.paidWith && (
          <Button size="sm" variant="outline" onClick={() => setRefund(b)}>
            Refund
          </Button>
        ),
    },
  ]

  return (
    <>
      <PageHeader title="All bookings" subtitle={list.total != null ? plural(list.total, 'booking') : ' '} />
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <Input placeholder="Ref, guest name or email" value={f.q} onChange={set('q')} />
        <Select value={f.status} onChange={set('status')} placeholder="All statuses" options={bookingStatuses.map((s) => ({ value: s, label: statuses[s][0] }))} />
        <Input type="date" value={f.from} onChange={set('from')} />
        <Input type="date" value={f.to} onChange={set('to')} />
      </div>
      <ErrorBox error={list.error} />
      {list.isPending ? <PageSpinner /> : <Table columns={columns} rows={list.items} empty="No bookings match." />}
      <LoadMore query={list} />
      <PromptModal
        open={!!refund}
        onClose={() => setRefund(null)}
        title={`Refund ${refund?.ref}`}
        confirmLabel="Refund"
        askAmount
        amountHint="Leave empty to refund everything that is still refundable."
        askReason
        onConfirm={({ reason, amount }) => refundBooking(refund.ref, { reason, amount }).then(() => qc.invalidateQueries({ queryKey: ['platform-bookings'] }))}
      />
    </>
  )
}
