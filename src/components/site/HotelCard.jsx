import { Link } from 'react-router'
import { tshShort } from '../../lib/format'

export function Heart({ on, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      aria-label={on ? 'Remove from saved' : 'Save'}
      className={`grid size-10 place-items-center rounded-full bg-black/35 text-xl backdrop-blur transition hover:scale-105 ${on ? 'text-primary' : 'text-white'} ${className}`}
    >
      {on ? '♥' : '♡'}
    </button>
  )
}

/** Photo card for search results and saved stays. `stay` (dates/guests) is forwarded to the hotel page. */
export default function HotelCard({ hotel, liked, onLike, search = '' }) {
  return (
    <Link to={`/hotels/${hotel.slug || hotel.id}${search}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-field">
        {hotel.img && (
          <img src={hotel.img} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        <span className="absolute left-3 top-3 rounded-xl bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {tshShort(hotel.price)} <span className="font-normal text-white/75">/ night</span>
        </span>
        {onLike && <Heart on={liked} onClick={() => onLike(hotel.id)} className="absolute right-3 top-3" />}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{hotel.name}</h3>
          <p className="truncate text-sm text-muted">
            {hotel.place}
            {hotel.distanceKm != null && ` · ${hotel.distanceKm.toFixed(1)} km away`}
          </p>
        </div>
        {hotel.reviewCount > 0 && (
          <span className="shrink-0 text-sm font-semibold">
            <span className="text-star">★</span> {hotel.rating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  )
}

export function HotelGrid({ hotels, fav, search }) {
  return (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {hotels.map((h) => (
        <HotelCard key={h.id} hotel={h} liked={fav?.has(h.id)} onLike={fav?.toggle} search={search} />
      ))}
    </div>
  )
}
