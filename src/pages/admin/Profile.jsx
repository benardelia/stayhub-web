// Hotel profile editor (hotel admins): details, photos, amenities, times, location, and submit for review.
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { submitHotel, updateHotel } from '../../api/admin'
import { useHotelCtx } from '../../components/admin/HotelContext'
import ImageUploader from '../../components/admin/ImageUploader'
import { amenities, hotelTypes } from '../../content'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Checkbox, Input, Select, Textarea } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { ErrorBox } from '../../components/ui/States'

const numOrNull = (v) => (v === '' || v == null ? null : Number(v))

export default function HotelProfile() {
  const { hotelId, hotel } = useHotelCtx()
  const qc = useQueryClient()
  const [f, setF] = useState({
    name: hotel.name,
    type: hotel.type,
    place: hotel.place,
    city: hotel.city,
    region: hotel.region,
    about: hotel.about,
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    lat: hotel.lat || '',
    lng: hotel.lng || '',
    kmFromCenter: hotel.kmFromCenter ?? '',
    amenities: hotel.amenities ?? [],
    photos: hotel.photos ?? [],
  })
  const [state, setState] = useState({ busy: '', error: null, note: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const fe = state.error?.fields ?? {}
  const extra = (f.amenities ?? []).filter((a) => !amenities.includes(a))

  const save = async () => {
    await updateHotel(hotelId, { ...f, lat: numOrNull(f.lat), lng: numOrNull(f.lng), kmFromCenter: numOrNull(f.kmFromCenter) })
    await qc.invalidateQueries({ queryKey: ['admin-hotel', hotelId] })
  }
  const run = async (name, fn, note) => {
    setState({ busy: name, error: null, note: '' })
    try {
      await fn()
      setState({ busy: '', error: null, note })
    } catch (error) {
      setState({ busy: '', error, note: '' })
    }
  }

  const canSubmit = hotel.status === 'draft'
  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        run('save', save, 'Saved.')
      }}
    >
      <PageHeader
        title="Hotel profile"
        subtitle={
          hotel.status === 'pending_review'
            ? 'Submitted — the Estantly team will review and publish it.'
            : hotel.status === 'suspended'
              ? 'This property is suspended. Contact support.'
              : 'What guests see on your listing.'
        }
        actions={
          canSubmit && (
            <Button
              variant="dark"
              loading={state.busy === 'submit'}
              onClick={() =>
                run(
                  'submit',
                  async () => {
                    await save()
                    await submitHotel(hotelId)
                    await qc.invalidateQueries({ queryKey: ['admin-hotel', hotelId] })
                    qc.invalidateQueries({ queryKey: ['my-hotels'] })
                  },
                  'Submitted for review.',
                )
              }
            >
              Submit for review
            </Button>
          )
        }
      />

      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={f.name} onChange={set('name')} error={fe.name} />
          <Select label="Type" value={f.type} onChange={set('type')} options={hotelTypes} error={fe.type} />
          <Input label="Place (shown to guests)" placeholder="Kendwa, Zanzibar" value={f.place} onChange={set('place')} error={fe.place} />
          <Input label="City" value={f.city} onChange={set('city')} error={fe.city} />
          <Input label="Region" value={f.region} onChange={set('region')} error={fe.region} />
          <Input label="Km from centre" type="number" step="0.1" min="0" value={f.kmFromCenter} onChange={set('kmFromCenter')} error={fe.kmFromCenter} />
          <Input label="Check-in from" type="time" value={f.checkInTime} onChange={set('checkInTime')} error={fe.checkInTime} />
          <Input label="Check-out until" type="time" value={f.checkOutTime} onChange={set('checkOutTime')} error={fe.checkOutTime} />
          <Input label="Latitude" type="number" step="any" value={f.lat} onChange={set('lat')} error={fe.lat} hint="From Google Maps: right-click the property → copy the coordinates" />
          <Input label="Longitude" type="number" step="any" value={f.lng} onChange={set('lng')} error={fe.lng} />
        </div>
        <Textarea label="About" rows={6} value={f.about} onChange={set('about')} error={fe.about} />
      </Card>

      <Card>
        <p className="mb-3 font-bold">Photos</p>
        <p className="mb-4 text-sm text-muted">The first photo is the cover. JPEG, PNG or WebP.</p>
        <ImageUploader hotelId={hotelId} value={f.photos} onChange={(photos) => setF({ ...f, photos })} />
        {fe.photos && <p className="mt-2 text-xs text-danger">{fe.photos}</p>}
      </Card>

      <Card>
        <p className="mb-3 font-bold">Amenities</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[...amenities, ...extra].map((a) => (
            <Checkbox
              key={a}
              label={a}
              checked={f.amenities.includes(a)}
              onChange={() => setF({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] })}
            />
          ))}
        </div>
      </Card>

      {state.error?.code === 'validation_failed' && Object.keys(fe).some((k) => k === 'rooms' || k === 'photos' || k === 'place') && (
        <ErrorBox error={new Error(`Before submitting: ${Object.entries(fe).map(([k, v]) => `${k} ${v}`).join('; ')}.`)} />
      )}
      <ErrorBox error={state.error?.code === 'validation_failed' ? null : state.error} />
      <div className="flex items-center gap-3">
        <Button type="submit" loading={state.busy === 'save'}>
          Save changes
        </Button>
        {state.note && <span className="text-sm text-success">{state.note}</span>}
      </div>
    </form>
  )
}
