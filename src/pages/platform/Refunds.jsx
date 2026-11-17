// Refunds. Some providers (e.g. Pesapal mobile money) can't refund automatically: those stay "pending"
// until someone pays the guest back by hand and records the outcome here.
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { completeRefund, getRefunds } from '../../api/platform'
import { refundStatuses, statuses } from '../../content'
import { tsh } from '../../lib/format'
import { usePaged } from '../../lib/query'
import { refundColumns } from '../admin/columns'
import Button from '../../components/ui/Button'
import { Checkbox, Input, Select } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox, LoadMore } from '../../components/ui/States'

export default function PlatformRefunds() {
  const [status, setStatus] = useState('pending')
  const [complete, setComplete] = useState(null)
  const list = usePaged(['platform-refunds'], getRefunds, { status, limit: 25 })
  const columns = [
    ...refundColumns,
    {
      key: 'actions',
      label: '',
      render: (r) =>
        r.status === 'pending' && (
          <Button size="sm" variant="outline" onClick={() => setComplete(r)}>
            Record outcome
          </Button>
        ),
    },
  ]
  return (
    <>
      <PageHeader title="Refunds" subtitle="Pending refunds need a manual payout and then a recorded outcome." />
      <Select className="mb-5 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All statuses" options={refundStatuses.map((s) => ({ value: s, label: statuses[s][0] }))} />
      <ErrorBox error={list.error} />
      {list.isPending ? <PageSpinner /> : <Table columns={columns} rows={list.items} empty="No refunds." />}
      <LoadMore query={list} />
      {complete && <CompleteForm refund={complete} onClose={() => setComplete(null)} />}
    </>
  )
}

function CompleteForm({ refund, onClose }) {
  const qc = useQueryClient()
  const [f, setF] = useState({ succeeded: true, providerReference: '', failureReason: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await completeRefund(refund.id, f)
      qc.invalidateQueries({ queryKey: ['platform-refunds'] })
      onClose()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }
  return (
    <Modal open onClose={onClose} title={`Refund ${tsh(refund.amount)} — ${refund.bookingRef}`}>
      <form onSubmit={save} className="space-y-4">
        <Checkbox label="The guest was paid back" checked={f.succeeded} onChange={(e) => setF({ ...f, succeeded: e.target.checked })} />
        {f.succeeded ? (
          <Input label="Transaction reference" required placeholder="M-Pesa or bank reference" value={f.providerReference} onChange={(e) => setF({ ...f, providerReference: e.target.value })} />
        ) : (
          <Input label="Why it failed" required value={f.failureReason} onChange={(e) => setF({ ...f, failureReason: e.target.value })} />
        )}
        <ErrorBox error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
