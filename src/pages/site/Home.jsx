import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getDestinations, searchHotels } from '../../api/catalog'
import { brand, heroImage, hotelTypes } from '../../content'
import { defaultStay } from '../../lib/dates'
import { useFavourites } from '../../hooks/useFavourites'
import { HotelGrid } from '../../components/site/HotelCard'
import StayPicker from '../../components/site/StayPicker'
import { stayQuery } from '../../lib/stay'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { PageSpinner } from '../../components/ui/Spinner'
import { ErrorBox } from '../../components/ui/States'

export default function Home() {
  const navigate = useNavigate()
  const fav = useFavourites()
  const [q, setQ] = useState('')
  const [stay, setStay] = useState({ ...defaultStay(), adults: 2, children: 0 })

  const destinations = useQuery({ queryKey: ['destinations'], queryFn: getDestinations, staleTime: 5 * 60_000 })
  const featured = useQuery({ queryKey: ['hotels', 'featured'], queryFn: () => searchHotels({ sort: 'recommended', limit: 6 }) })

  const search = (e) => {
    e.preventDefault()
    navigate(`/search?${new URLSearchParams({ q }).toString()}&${stayQuery(stay)}`)
  }

  return (
    <>
      <section className="relative -mx-5 -mt-8 overflow-hidden md:-mx-8">
        <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative px-5 pb-10 pt-20 text-white md:px-8 md:pb-14 md:pt-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">{brand.subtitle}</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight md:text-5xl">{brand.tagline}.</h1>
          <p className="mt-4 max-w-xl text-white/85">From cozy lodges to luxury resorts — find the perfect place for your next trip and pay with M-Pesa or card.</p>

          <form onSubmit={search} className="mt-8 rounded-3xl bg-card p-4 text-ink shadow-xl md:p-5">
            <Input label="Where are you going?" placeholder="Zanzibar, Arusha, Dodoma…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="mt-3">
              <StayPicker value={stay} onChange={setStay} />
            </div>
            <Button type="submit" size="lg" className="mt-4 w-full sm:w-auto">
              Search stays
            </Button>
          </form>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Browse by type</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {hotelTypes.map((t) => (
            <Link key={t} to={`/search?type=${encodeURIComponent(t)}`} className="rounded-full bg-field px-5 py-2.5 text-sm font-semibold hover:bg-soft hover:text-primary">
              {t}
            </Link>
          ))}
        </div>
      </section>

      {destinations.data?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Popular destinations</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {destinations.data.map((d) => (
              <Link key={d.id} to={`/search?q=${encodeURIComponent(d.name)}`} className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-field">
                <img src={d.img} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-lg font-bold">{d.name}</p>
                  <p className="text-sm text-white/80">{d.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">Guests love these</h2>
          <Link to="/search" className="text-sm font-semibold text-primary">
            See all →
          </Link>
        </div>
        <ErrorBox error={featured.error} />
        {featured.isPending ? <PageSpinner /> : featured.data && <HotelGrid hotels={featured.data.items} fav={fav} />}
      </section>
    </>
  )
}
