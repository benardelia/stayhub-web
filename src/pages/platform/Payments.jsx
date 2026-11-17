import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getPayments, refundPayment } from '../../api/platform'
import { paymentStatuses, statuses } from '../../content'
import { tsh } from '../../lib/format'
import { usePaged } from '../../lib/query'
import { paymentColumns } from '../admin/columns'
import { Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import PromptModal from '../../components/ui/PromptModal'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox, LoadMore } from '../../components/ui/States'

export default function PlatformPayments() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [refund, setRefund] = useState(null)
  const list = usePaged(['platform-payments'], getPayments, { status, limit: 25 })
  const columns = [...paymentColumns(setRefund).slice(0, 1), { key: 'provider', label: 'Provider' }, ...paymentColumns(setRefund).slice(1)]

  return (
    <>
      <PageHeader title="All payments" />
      <Select className="mb-5 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All statuses" options={paymentStatuses.map((s) => ({ value: s, label: statuses[s][0] }))} />
      <ErrorBox error={list.error} />
      {list.isPending ? <PageSpinner /> : <Table columns={columns} rows={list.items} empty="No payments." />}
      <LoadMore query={list} />
      <PromptModal
        open={!!refund}
        onClose={() => setRefund(null)}
        title={`Refund payment for ${refund?.bookingRef}`}
        confirmLabel="Refund"
        askAmount
        amountHint={refund && `Up to ${tsh(refund.amount - refund.refundedAmount)}.`}
        askReason
        onConfirm={({ reason, amount }) => refundPayment(refund.id, { reason, amount }).then(() => qc.invalidateQueries({ queryKey: ['platform-payments'] }))}
      />
    </>
  )
}
