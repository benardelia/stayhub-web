import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPayments, getPayouts, getRefunds, refundPayment } from '../../api/admin'
import { useHotelCtx } from '../../components/admin/HotelContext'
import { paymentColumns, refundColumns } from './columns'
import { monthRange, today } from '../../lib/dates'
import { fmtDate, pct, tsh } from '../../lib/format'
import { usePaged } from '../../lib/query'
import { Stat } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import PromptModal from '../../components/ui/PromptModal'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import Tabs from '../../components/ui/Tabs'
import { ErrorBox, LoadMore } from '../../components/ui/States'

const TABS = [
  { value: 'payouts', label: 'Payouts' },
  { value: 'payments', label: 'Payments' },
  { value: 'refunds', label: 'Refunds' },
]

export default function Money() {
  const [tab, setTab] = useState('payouts')
  return (
    <>
      <PageHeader title="Payments" subtitle="What guests paid, what was refunded and what Estantly pays out to you." />
      <Tabs options={TABS} value={tab} onChange={setTab} className="mb-6" />
      {tab === 'payouts' && <Payouts />}
      {tab === 'payments' && <Payments />}
      {tab === 'refunds' && <Refunds />}
    </>
  )
}

function Payouts() {
  const { hotelId } = useHotelCtx()
  const year = today().slice(0, 4)
  const [p, setP] = useState({ from: `${year}-01-01`, to: monthRange(today()).to, granularity: 'month' })
  const q = useQuery({ queryKey: ['payouts', hotelId, p], queryFn: () => getPayouts(hotelId, p) })
  const r = q.data
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-3">
        <Input type="date" value={p.from} onChange={(e) => setP({ ...p, from: e.target.value })} />
        <Input type="date" value={p.to} onChange={(e) => setP({ ...p, to: e.target.value })} />
        <Select value={p.granularity} onChange={(e) => setP({ ...p, granularity: e.target.value })} options={[{ value: 'month', label: 'By month' }, { value: 'day', label: 'By day' }]} />
      </div>
      <ErrorBox error={q.error} />
      {q.isPending ? (
        <PageSpinner />
      ) : (
        r && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Gross" value={tsh(r.gross)} />
              <Stat label="Refunds" value={tsh(r.refunds)} />
              <Stat label="Commission" value={tsh(r.commission)} hint={`${pct(r.commissionRateBps)} of room revenue`} />
              <Stat label="Net payout" value={tsh(r.net)} />
            </div>
            <div className="mt-6">
              <Table
                rowKey="periodStart"
                columns={[
                  { key: 'periodStart', label: 'Period', render: (x) => fmtDate(x.periodStart) },
                  { key: 'gross', label: 'Gross', render: (x) => tsh(x.gross), className: 'text-right' },
                  { key: 'refunds', label: 'Refunds', render: (x) => tsh(x.refunds), className: 'text-right' },
                  { key: 'commission', label: 'Commission', render: (x) => tsh(x.commission), className: 'text-right' },
                  { key: 'net', label: 'Net', render: (x) => <b>{tsh(x.net)}</b>, className: 'text-right' },
                ]}
                rows={r.periods}
                empty="No payments in this period."
              />
            </div>
          </>
        )
      )}
    </>
  )
}

function Payments() {
  const { hotelId } = useHotelCtx()
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [refund, setRefund] = useState(null)
  const list = usePaged(['admin-payments', hotelId], (p) => getPayments(hotelId, p), { status, limit: 25 })
  return (
    <>
      <Select
        className="mb-5 max-w-xs"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        placeholder="All statuses"
        options={['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded']}
      />
      <ErrorBox error={list.error} />
      {list.isPending ? <PageSpinner /> : <Table columns={paymentColumns(setRefund)} rows={list.items} empty="No payments yet." />}
      <LoadMore query={list} />
      <PromptModal
        open={!!refund}
        onClose={() => setRefund(null)}
        title={`Refund payment for ${refund?.bookingRef}`}
        confirmLabel="Refund"
        askAmount
        amountHint={refund && `Up to ${tsh(refund.amount - refund.refundedAmount)}. Leave empty for the full remaining amount.`}
        askReason
        onConfirm={({ reason, amount }) =>
          refundPayment(hotelId, refund.id, { reason, amount }).then(() => {
            qc.invalidateQueries({ queryKey: ['admin-payments', hotelId] })
            qc.invalidateQueries({ queryKey: ['admin-refunds', hotelId] })
          })
        }
      />
    </>
  )
}

function Refunds() {
  const { hotelId } = useHotelCtx()
  const list = usePaged(['admin-refunds', hotelId], (p) => getRefunds(hotelId, p), { limit: 25 })
  return (
    <>
      <ErrorBox error={list.error} />
      {list.isPending ? <PageSpinner /> : <Table columns={refundColumns} rows={list.items} empty="No refunds." />}
      <LoadMore query={list} />
    </>
  )
}
