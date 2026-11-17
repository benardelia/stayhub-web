// /admin: the hotels I work at, and a form to list a new one.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { createHotel } from '../../api/admin'
import { getMyHotels } from '../../api/guest'
import { hotelTypes, roles } from '../../content'
import { Logo } from '../../components/site/Navbar'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import { ErrorBox } from '../../components/ui/States'

export default function MyHotels() {
  const hotels = useQuery({ queryKey: ['my-hotels'], queryFn: getMyHotels })

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="mb-10 flex items-center justify-between">
        <Logo />
        <Link to="/" className="text-sm font-semibold text-muted hover:text-ink">
          ← Back to site
        </Link>
      </div>
      <PageHeader eyebrow="Hotel back office" title="Your properties" subtitle="Manage bookings, rooms, rates and payouts for the hotels you work at." />
      <ErrorBox error={hotels.error} />
      {hotels.isPending ? (
        <PageSpinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {hotels.data?.map((m) => (
            <Link key={m.hotelId} to={`/admin/hotels/${m.hotelId}`} className="block rounded-3xl border border-line bg-card p-5 transition hover:border-primary">
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-bold">{m.hotelName}</p>
                <StatusBadge status={m.hotelStatus} />
              </div>
              <p className="mt-1 text-sm text-muted">{roles[m.role] ?? m.role}</p>
            </Link>
          ))}
          <NewHotel />
        </div>
      )}
    </div>
  )
}

function NewHotel() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', type: 'Hotels', place: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const h = await createHotel({ name: f.name.trim(), type: f.type, place: f.place.trim() || undefined })
      navigate(`/admin/hotels/${h.id}/profile`)
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-3xl border-2 border-dashed border-line p-5 text-left transition hover:border-primary">
        <p className="text-lg font-bold">+ List a property</p>
        <p className="mt-1 text-sm text-muted">Create a draft, add rooms and photos, then submit it for review.</p>
      </button>
    )
  }
  return (
    <Card>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Property name" required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={error?.fields?.name} />
        <Select label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} options={hotelTypes} />
        <Input label="Place" placeholder="Kendwa, Zanzibar" value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} />
        <ErrorBox error={error?.code === 'validation_failed' ? null : error} />
        <div className="flex gap-2">
          <Button type="submit" loading={busy}>
            Create draft
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
