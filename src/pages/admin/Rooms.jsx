import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoom, deleteRoom, getRates, getRooms, setRates, updateRoom } from '../../api/admin'
import { useHotelCtx } from '../../components/admin/HotelContext'
import ImageUploader from '../../components/admin/ImageUploader'
import { addDays, monthRange, today } from '../../lib/dates'
import { plural, tsh, tshShort } from '../../lib/format'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Checkbox, Input, Textarea } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import PromptModal from '../../components/ui/PromptModal'
import { PageSpinner } from '../../components/ui/Spinner'
import { Empty, ErrorBox } from '../../components/ui/States'

export default function Rooms() {
  const { hotelId, isAdmin } = useHotelCtx()
  const rooms = useQuery({ queryKey: ['admin-rooms', hotelId], queryFn: () => getRooms(hotelId) })
  const [editing, setEditing] = useState(null) // room or {} for new
  const [rates, setRatesFor] = useState(null)
  const [removing, setRemoving] = useState(null)
  const qc = useQueryClient()
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-rooms', hotelId] })
    qc.invalidateQueries({ queryKey: ['admin-hotel', hotelId] })
  }

  return (
    <>
      <PageHeader title="Rooms & rates" subtitle="Room types guests can book, their base price and day-by-day overrides." actions={isAdmin && <Button onClick={() => setEditing({})}>Add room type</Button>} />
      <ErrorBox error={rooms.error} />
      {rooms.isPending ? (
        <PageSpinner />
      ) : rooms.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.data.map((r) => (
            <Card key={r.id} className="flex gap-4">
              <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-field">{r.photos?.[0] && <img src={r.photos[0]} alt="" className="size-full object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">{r.name}</p>
                  {!r.active && <Badge>Hidden</Badge>}
                </div>
                <p className="text-sm text-muted">
                  {tsh(r.price)} / night · {plural(r.units, 'unit')} · sleeps {r.maxAdults}
                  {r.maxChildren > 0 && `+${r.maxChildren}`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="soft" onClick={() => setRatesFor(r)}>
                    Rates & closures
                  </Button>
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRemoving(r)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty title="No room types yet" action={isAdmin && <Button onClick={() => setEditing({})}>Add room type</Button>}>
          Add at least one active room type before submitting the property for review.
        </Empty>
      )}

      {editing && <RoomForm room={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
      {rates && <RatesModal room={rates} onClose={() => setRatesFor(null)} />}
      <PromptModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={`Delete ${removing?.name}?`}
        message="Only room types that were never booked can be deleted. Hide a booked one instead (Edit → untick Active)."
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteRoom(hotelId, removing.id).then(refresh)}
      />
    </>
  )
}

function RoomForm({ room, onClose, onSaved }) {
  const { hotelId } = useHotelCtx()
  const isNew = !room.id
  const [f, setF] = useState({
    name: room.name ?? '',
    description: room.description ?? '',
    price: room.price ?? '',
    units: room.units ?? 1,
    maxAdults: room.maxAdults ?? 2,
    maxChildren: room.maxChildren ?? 0,
    active: room.active ?? true,
    photos: room.photos ?? [],
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const fe = error?.fields ?? {}

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const input = { ...f, price: Number(f.price), units: Number(f.units), maxAdults: Number(f.maxAdults), maxChildren: Number(f.maxChildren) }
    try {
      await (isNew ? createRoom(hotelId, input) : updateRoom(hotelId, room.id, input))
      onSaved()
      onClose()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'New room type' : `Edit ${room.name}`} wide>
      <form onSubmit={save} className="space-y-4">
        <Input label="Name" required value={f.name} onChange={set('name')} error={fe.name} placeholder="Deluxe Ocean View" />
        <Textarea label="Description" rows={3} value={f.description} onChange={set('description')} error={fe.description} />
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="Price / night (TSh)" type="number" min="1" required value={f.price} onChange={set('price')} error={fe.price} />
          <Input label="Units" type="number" min="0" value={f.units} onChange={set('units')} error={fe.units} hint="How many identical rooms" />
          <Input label="Max adults" type="number" min="1" value={f.maxAdults} onChange={set('maxAdults')} error={fe.maxAdults} />
          <Input label="Max children" type="number" min="0" value={f.maxChildren} onChange={set('maxChildren')} error={fe.maxChildren} />
        </div>
        <Checkbox label="Active (guests can book it)" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
        <div>
          <p className="mb-2 text-sm font-semibold">Photos</p>
          <ImageUploader hotelId={hotelId} value={f.photos} onChange={(photos) => setF({ ...f, photos })} />
        </div>
        <ErrorBox error={error?.code === 'validation_failed' ? null : error} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function RatesModal({ room, onClose }) {
  const { hotelId, isAdmin } = useHotelCtx()
  const qc = useQueryClient()
  const [month, setMonth] = useState(monthRange(today()).from)
  const range = monthRange(month)
  const rates = useQuery({ queryKey: ['rates', room.id, range], queryFn: () => getRates(hotelId, room.id, range) })
  const byDay = Object.fromEntries((rates.data ?? []).map((r) => [r.date, r]))
  const [f, setF] = useState({ from: today(), to: addDays(today(), 6), price: '', closed: false })
  const [busy, setBusy] = useState('')
  const [error, setError] = useState(null)

  const apply = async (reset) => {
    setBusy(reset ? 'reset' : 'set')
    setError(null)
    try {
      await setRates(hotelId, room.id, { from: f.from, to: f.to, price: f.price ? Number(f.price) : null, closed: f.closed, reset })
      qc.invalidateQueries({ queryKey: ['rates', room.id] })
    } catch (e) {
      setError(e)
    } finally {
      setBusy('')
    }
  }

  // Calendar grid for the month, Monday first.
  const first = new Date(`${range.from}T00:00:00`)
  const lead = (first.getDay() + 6) % 7
  const days = Number(range.to.slice(8))
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${range.from.slice(0, 8)}${String(i + 1).padStart(2, '0')}`)]
  const shift = (n) => {
    const d = new Date(`${month}T00:00:00`)
    d.setMonth(d.getMonth() + n)
    setMonth(monthRange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`).from)
  }

  return (
    <Modal open onClose={onClose} title={`${room.name} — rates`} wide>
      <div className="mb-3 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={() => shift(-1)}>
          ←
        </Button>
        <p className="font-bold">{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
        <Button size="sm" variant="outline" onClick={() => shift(1)}>
          →
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 font-semibold text-muted">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`x${i}`} />
          const r = byDay[d]
          return (
            <div key={d} className={`rounded-xl p-1.5 ${r?.closed ? 'bg-danger/12 text-danger' : r?.price != null ? 'bg-soft text-primary' : 'bg-field'}`}>
              <p className="font-bold">{Number(d.slice(8))}</p>
              <p className="truncate text-[10px]">{r?.closed ? 'Closed' : tshShort(r?.price ?? room.price)}</p>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-muted">Grey: base price {tsh(room.price)}. Pink: price override. Red: closed to new bookings.</p>

      {isAdmin && (
        <div className="mt-6 space-y-3 border-t border-line pt-5">
          <p className="font-bold">Change a date range</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="From" type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
            <Input label="To" type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
            <Input label="Price / night (TSh)" type="number" min="1" placeholder={String(room.price)} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          </div>
          <Checkbox label="Closed — no new bookings on these nights" checked={f.closed} onChange={(e) => setF({ ...f, closed: e.target.checked })} />
          <ErrorBox error={error} />
          <div className="flex flex-wrap gap-2">
            <Button loading={busy === 'set'} onClick={() => apply(false)}>
              Apply to range
            </Button>
            <Button variant="outline" loading={busy === 'reset'} onClick={() => apply(true)}>
              Reset range to base price
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
