import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getHotel, getReviews, getRooms } from '../../api/catalog'
import { defaultStay, nightsBetween } from '../../lib/dates'
import { fmtDate, plural, tsh } from '../../lib/format'
import { usePaged } from '../../lib/query'
import { useFavourites } from '../../hooks/useFavourites'
import { Heart } from '../../components/site/HotelCard'
import StayPicker from '../../components/site/StayPicker'
import { stayFromParams, stayQuery } from '../../lib/stay'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'
import Stars from '../../components/ui/Stars'
import { Empty, ErrorBox, LoadMore } from '../../components/ui/States'

export default function HotelDetail() {
  const { id } = useParams()
  const [sp, setSp] = useSearchParams()
  const navigate = useNavigate()
  const fav = useFavourites()
  const stay = stayFromParams(sp, defaultStay())
  const [photo, setPhoto] = useState(0)

  const hotel = useQuery({ queryKey: ['hotel', id], queryFn: () => getHotel(id) })
  const h = hotel.data
  const rooms = useQuery({
    queryKey: ['rooms', h?.id, stay],
    enabled: !!h,
    queryFn: () => getRooms(h.id, stay),
  })
  const reviews = usePaged(['reviews', h?.id], (p) => getReviews(h.id, p), { limit: 5 }, { enabled: !!h })

  if (hotel.isPending) return <PageSpinner />
  if (hotel.error) return <ErrorBox error={hotel.error} />

  const photos = [h.img, ...(h.photos ?? [])].filter((x, i, a) => x && a.indexOf(x) === i)
  const nights = nightsBetween(stay.checkIn, stay.checkOut)
  const reserve = (room) =>
    navigate(`/checkout?${new URLSearchParams({ hotel: h.id, room: room.id })}&${stayQuery(stay)}`)

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-field">
          {photos[photo] && <img src={photos[photo]} alt={h.name} className="size-full object-cover" />}
          <Heart on={fav.has(h.id)} onClick={() => fav.toggle(h.id)} className="absolute right-4 top-4" />
        </div>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-2 md:content-start">
          {photos.slice(0, 8).map((p, i) => (
            <button key={p} type="button" onClick={() => setPhoto(i)} className={`aspect-square overflow-hidden rounded-2xl bg-field ring-primary ${i === photo ? 'ring-2' : ''}`}>
              <img src={p} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">{h.type}</Badge>
            {h.reviewCount > 0 && (
              <Badge>
                <span className="text-star">★</span>&nbsp;{h.rating.toFixed(1)} · {plural(h.reviewCount, 'review')}
              </Badge>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{h.name}</h1>
          <p className="mt-2 text-muted">
            {h.place}
            {h.kmFromCenter != null && ` · ${h.kmFromCenter} km from centre`}
          </p>

          <h2 className="mt-8 text-lg font-bold">Overview</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{h.about}</p>

          {h.amenities?.length > 0 && (
            <>
              <h2 className="mt-8 text-lg font-bold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {h.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-field px-4 py-2 text-sm font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-10 text-lg font-bold">Choose your room</h2>
          <p className="text-sm text-muted">Prices for {plural(nights, 'night')}, {fmtDate(stay.checkIn)} – {fmtDate(stay.checkOut)}.</p>
          <ErrorBox error={rooms.error} className="mt-3" />
          <div className="mt-4 space-y-4">
            {rooms.isPending ? (
              <PageSpinner />
            ) : rooms.data?.length ? (
              rooms.data.map((r) => (
                <Card key={r.id} className="flex flex-col gap-4 sm:flex-row">
                  {(r.photos?.[0] || h.img) && <img src={r.photos?.[0] || h.img} alt="" className="h-36 w-full rounded-2xl object-cover sm:w-48" loading="lazy" />}
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-bold">{r.name}</h3>
                    {r.description && <p className="mt-1 text-sm text-muted">{r.description}</p>}
                    <p className="mt-2 text-xs text-muted">
                      Sleeps {plural(r.maxAdults, 'adult')}
                      {r.maxChildren > 0 && ` + ${plural(r.maxChildren, 'child', 'children')}`}
                    </p>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                      <div>
                        <p className="text-lg font-bold">{tsh(r.quote?.total ?? r.price)}</p>
                        <p className="text-xs text-muted">{r.quote ? `total incl. taxes · ${tsh(r.price)} / night` : '/ night'}</p>
                      </div>
                      {r.available ? (
                        <div className="text-right">
                          {r.unitsLeft > 0 && r.unitsLeft <= 3 && <p className="mb-1 text-xs font-semibold text-warning">Only {r.unitsLeft} left</p>}
                          <Button onClick={() => reserve(r)}>Reserve</Button>
                        </div>
                      ) : (
                        <Badge tone="danger">Not available for these dates</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Empty title="No rooms listed yet" />
            )}
          </div>

          <h2 className="mt-10 text-lg font-bold">Reviews</h2>
          <div className="mt-3 space-y-4">
            {reviews.items.map((rv) => (
              <Card key={rv.id}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{rv.authorName}</p>
                  <Stars value={rv.rating} size="text-sm" />
                </div>
                <p className="mt-2 text-sm text-muted">{rv.comment}</p>
                {rv.reply && (
                  <div className="mt-3 rounded-2xl bg-field p-3 text-sm">
                    <p className="font-semibold">Reply from the hotel</p>
                    <p className="mt-1 text-muted">{rv.reply}</p>
                  </div>
                )}
              </Card>
            ))}
            {!reviews.isPending && !reviews.items.length && <p className="text-sm text-muted">No reviews yet.</p>}
            <LoadMore query={reviews} />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <p className="text-sm text-muted">From</p>
            <p className="text-2xl font-bold">
              {tsh(h.price)} <span className="text-sm font-normal text-muted">/ night</span>
            </p>
            <div className="mt-4">
              <StayPicker compact value={stay} onChange={(s) => setSp(new URLSearchParams(stayQuery(s)), { replace: true })} />
            </div>
            <p className="mt-4 text-xs text-muted">
              Check-in from {h.checkInTime} · check-out until {h.checkOutTime}
            </p>
          </Card>
          {h.lat != null && (
            <Card className="overflow-hidden p-0">
              <iframe
                title="Map"
                className="h-56 w-full"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${h.lng - 0.02},${h.lat - 0.015},${h.lng + 0.02},${h.lat + 0.015}&layer=mapnik&marker=${h.lat},${h.lng}`}
              />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                target="_blank"
                rel="noreferrer"
                className="block px-5 py-3 text-sm font-semibold text-primary"
              >
                Get directions →
              </a>
            </Card>
          )}
        </aside>
      </div>
    </>
  )
}
