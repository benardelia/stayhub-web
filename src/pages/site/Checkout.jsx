import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getHotel, getQuote, getRooms } from '../../api/catalog'
import { createBooking } from '../../api/guest'
import { newIdempotencyKey } from '../../api/client'
import { fmtDate, guests, plural, tsh } from '../../lib/format'
import Button from '../../components/ui/Button'
import Card, { Row } from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import { ErrorBox } from '../../components/ui/States'

export default function Checkout() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const input = {
    hotelId: sp.get('hotel'),
    roomTypeId: sp.get('room'),
    checkIn: sp.get('checkIn'),
    checkOut: sp.get('checkOut'),
    adults: Number(sp.get('adults') || 2),
    children: Number(sp.get('children') || 0),
  }
  const hotel = useQuery({ queryKey: ['hotel', input.hotelId], queryFn: () => getHotel(input.hotelId) })
  const rooms = useQuery({ queryKey: ['rooms', input.hotelId, {}], queryFn: () => getRooms(input.hotelId) })
  const quote = useQuery({ queryKey: ['quote', input], queryFn: () => getQuote(input) })
  const room = rooms.data?.find((r) => r.id === input.roomTypeId)

  const key = useRef(newIdempotencyKey()) // one booking per visit, even if "Reserve" is pressed twice
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const reserve = async () => {
    setBusy(true)
    setError(null)
    try {
      const b = await createBooking(input, key.current)
      navigate(`/account/bookings/${b.ref}`, { replace: true })
    } catch (e) {
      setError(e)
      if (e.status && e.status < 500) key.current = newIdempotencyKey()
    } finally {
      setBusy(false)
    }
  }

  if (hotel.isPending || quote.isPending) return <PageSpinner />
  const q = quote.data

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Checkout" title="Review your booking" />
      <ErrorBox error={hotel.error || quote.error} className="mb-4" />
      {hotel.data && q && (
        <Card className="space-y-4">
          <div className="flex gap-4">
            {hotel.data.img && <img src={hotel.data.img} alt="" className="size-24 rounded-2xl object-cover" />}
            <div>
              <p className="text-lg font-bold">{hotel.data.name}</p>
              <p className="text-sm text-muted">{hotel.data.place}</p>
              <p className="mt-1 text-sm font-semibold">{room?.name}</p>
            </div>
          </div>
          <div className="border-t border-line pt-3">
            <Row label="Check in" value={`${fmtDate(q.checkIn)} · from ${hotel.data.checkInTime}`} />
            <Row label="Check out" value={`${fmtDate(q.checkOut)} · until ${hotel.data.checkOutTime}`} />
            <Row label="Guests" value={guests(q.adults, q.children)} />
          </div>
          <div className="border-t border-line pt-3">
            {q.nightly.map((n) => (
              <Row key={n.date} label={fmtDate(n.date)} value={tsh(n.price)} />
            ))}
            <Row label={`Subtotal (${plural(q.nights, 'night')})`} value={tsh(q.subtotal)} />
            <Row label="Taxes & fees" value={tsh(q.taxesFees)} />
          </div>
          <div className="border-t border-line pt-3">
            <Row bold label="Total" value={tsh(q.total)} />
          </div>
          {!q.available && <ErrorBox error={new Error('This room is no longer available for these dates. Pick other dates or another room.')} />}
          <ErrorBox error={error} />
          <Button size="lg" className="w-full" loading={busy} disabled={!q.available} onClick={reserve}>
            Reserve and continue to payment
          </Button>
          <p className="text-center text-xs text-muted">We hold the room for 15 minutes while you pay.</p>
        </Card>
      )}
    </div>
  )
}
