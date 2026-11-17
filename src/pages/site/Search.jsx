import { useSearchParams } from 'react-router'
import { searchHotels } from '../../api/catalog'
import { amenities, hotelTypes, sortOptions } from '../../content'
import { usePaged } from '../../lib/query'
import { plural, tsh } from '../../lib/format'
import { useFavourites } from '../../hooks/useFavourites'
import { HotelGrid } from '../../components/site/HotelCard'
import Card from '../../components/ui/Card'
import { Checkbox, Input, Select } from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import { Empty, ErrorBox, LoadMore } from '../../components/ui/States'

const PRICE_MAX = 1_000_000

export default function Search() {
  const [sp, setSp] = useSearchParams()
  const fav = useFavourites()

  const params = {
    q: sp.get('q') || '',
    type: sp.get('type') || '',
    maxPrice: sp.get('maxPrice') || '',
    amenities: sp.getAll('amenities'),
    sort: sp.get('sort') || 'recommended',
    checkIn: sp.get('checkIn') || '',
    checkOut: sp.get('checkOut') || '',
    adults: sp.get('adults') || '',
    children: sp.get('children') || '',
    limit: 12,
  }
  const results = usePaged(['hotels', 'search'], searchHotels, params)

  const set = (k, v) => {
    const next = new URLSearchParams(sp)
    next.delete(k)
    ;(Array.isArray(v) ? v : [v]).filter((x) => x !== '' && x != null).forEach((x) => next.append(k, x))
    setSp(next, { replace: true })
  }
  const toggleAmenity = (a) => set('amenities', params.amenities.includes(a) ? params.amenities.filter((x) => x !== a) : [...params.amenities, a])

  // Carry the stay to the hotel page so its rooms are priced for these dates.
  const stay = params.checkIn && params.checkOut ? `?${new URLSearchParams({ checkIn: params.checkIn, checkOut: params.checkOut, adults: params.adults || 2, children: params.children || 0 })}` : ''

  return (
    <>
      <PageHeader
        title={params.q ? `Stays in “${params.q}”` : 'Explore stays'}
        subtitle={results.total != null ? `${plural(results.total, 'stay')} found` : ' '}
      />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <Card className="space-y-4">
            <Input key={params.q} label="Destination or name" defaultValue={params.q} onKeyDown={(e) => e.key === 'Enter' && set('q', e.currentTarget.value)} onBlur={(e) => set('q', e.target.value)} />
            <Select label="Sort by" value={params.sort} onChange={(e) => set('sort', e.target.value)} options={sortOptions} />
            <Select label="Property type" value={params.type} onChange={(e) => set('type', e.target.value)} options={hotelTypes} placeholder="Any type" />
            <label className="block">
              <span className="mb-1.5 flex justify-between text-sm font-semibold">
                Max price / night <span className="text-primary">{params.maxPrice ? tsh(Number(params.maxPrice)) : 'Any'}</span>
              </span>
              <input
                key={params.maxPrice}
                type="range"
                min="50000"
                max={PRICE_MAX}
                step="10000"
                defaultValue={params.maxPrice || PRICE_MAX}
                onMouseUp={(e) => set('maxPrice', e.currentTarget.value === String(PRICE_MAX) ? '' : e.currentTarget.value)}
                onTouchEnd={(e) => set('maxPrice', e.currentTarget.value === String(PRICE_MAX) ? '' : e.currentTarget.value)}
                onKeyUp={(e) => set('maxPrice', e.currentTarget.value === String(PRICE_MAX) ? '' : e.currentTarget.value)}
                className="w-full accent-primary"
              />
            </label>
            <div>
              <p className="mb-2 text-sm font-semibold">Amenities</p>
              <div className="space-y-2">
                {amenities.map((a) => (
                  <Checkbox key={a} label={a} checked={params.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                ))}
              </div>
            </div>
          </Card>
        </aside>

        <section>
          <ErrorBox error={results.error} className="mb-4" />
          {results.isPending ? (
            <PageSpinner />
          ) : results.items.length ? (
            <>
              <HotelGrid hotels={results.items} fav={fav} search={stay} />
              <LoadMore query={results} />
            </>
          ) : (
            <Empty title="No stays match">Try another destination, a higher price or fewer amenities.</Empty>
          )}
        </section>
      </div>
    </>
  )
}
