import { useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { approveHotel, getHotels, setHotelRates, suspendHotel, unpublishHotel } from '../../api/platform'
import { hotelStatuses, statuses } from '../../content'
import { pct, plural, tsh } from '../../lib/format'
import { usePaged } from '../../lib/query'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Table from '../../components/ui/Table'
import { ErrorBox, LoadMore } from '../../components/ui/States'

export default function Hotels() {
  const qc = useQueryClient()
  const [f, setF] = useState({ status: 'pending_review', q: '' })
  const [rates, setRates] = useState(null)
  const [error, setError] = useState(null)
  const list = usePaged(['platform-hotels'], getHotels, { ...f, limit: 25 })
  const act = (fn) => {
    setError(null)
    fn().then(() => qc.invalidateQueries({ queryKey: ['platform-hotels'] }), setError)
  }

  return (
    <>
      <PageHeader title="Hotels" subtitle={list.total != null ? plural(list.total, 'hotel') : ' '} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Search by name or place" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} placeholder="All statuses" options={hotelStatuses.map((s) => ({ value: s, label: statuses[s][0] }))} />
      </div>
      <ErrorBox error={error || list.error} className="mb-4" />
      {list.isPending ? (
        <PageSpinner />
      ) : (
        <Table
          columns={[
            {
              key: 'name',
              label: 'Hotel',
              render: (h) => (
                <Link to={`/admin/hotels/${h.id}`} className="font-bold hover:text-primary">
                  {h.name}
                  <span className="block text-xs font-normal text-muted">
                    {h.type} · {h.place}
                  </span>
                </Link>
              ),
            },
            { key: 'price', label: 'From', render: (h) => tsh(h.price) },
            { key: 'rates', label: 'Commission / tax', render: (h) => `${pct(h.commissionRateBps)} / ${pct(h.taxRateBps)}` },
            { key: 'status', label: 'Status', render: (h) => <StatusBadge status={h.status} /> },
            {
              key: 'actions',
              label: '',
              render: (h) => (
                <div className="flex flex-wrap justify-end gap-1.5">
                  {(h.status === 'pending_review' || h.status === 'suspended') && (
                    <Button size="sm" onClick={() => act(() => approveHotel(h.id))}>
                      {h.status === 'suspended' ? 'Reinstate' : 'Publish'}
                    </Button>
                  )}
                  {(h.status === 'published' || h.status === 'pending_review') && (
                    <Button size="sm" variant="outline" onClick={() => act(() => unpublishHotel(h.id))}>
                      To draft
                    </Button>
                  )}
                  {h.status !== 'suspended' && (
                    <Button size="sm" variant="danger-outline" onClick={() => window.confirm(`Suspend ${h.name}? It disappears from search.`) && act(() => suspendHotel(h.id))}>
                      Suspend
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setRates(h)}>
                    Rates
                  </Button>
                </div>
              ),
            },
          ]}
          rows={list.items}
          empty="No hotels match."
        />
      )}
      <LoadMore query={list} />
      {rates && <RatesForm hotel={rates} onClose={() => setRates(null)} onSaved={() => qc.invalidateQueries({ queryKey: ['platform-hotels'] })} />}
    </>
  )
}

function RatesForm({ hotel, onClose, onSaved }) {
  // Edited as percentages, stored as basis points.
  const [f, setF] = useState({ commission: (hotel.commissionRateBps ?? 1000) / 100, tax: hotel.taxRateBps / 100 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await setHotelRates(hotel.id, { commissionRateBps: Math.round(f.commission * 100), taxRateBps: Math.round(f.tax * 100) })
      onSaved()
      onClose()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }
  return (
    <Modal open onClose={onClose} title={`Rates — ${hotel.name}`}>
      <form onSubmit={save} className="space-y-4">
        <Input label="Commission (% of room subtotal)" type="number" step="0.01" min="0" max="100" value={f.commission} onChange={(e) => setF({ ...f, commission: e.target.value })} />
        <Input label="Taxes & fees charged to guests (%)" type="number" step="0.01" min="0" max="100" value={f.tax} onChange={(e) => setF({ ...f, tax: e.target.value })} hint="Applies to new bookings and quotes." />
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
