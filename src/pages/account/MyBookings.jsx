import { Link, useSearchParams } from 'react-router'
import { getMyBookings } from '../../api/guest'
import { bookingTabs } from '../../content'
import { usePaged } from '../../lib/query'
import { fmtDate, tsh } from '../../lib/format'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import Tabs from '../../components/ui/Tabs'
import { Empty, ErrorBox, LoadMore } from '../../components/ui/States'

export default function MyBookings() {
  const [sp, setSp] = useSearchParams()
  const status = sp.get('tab') || 'upcoming'
  const list = usePaged(['my-bookings'], getMyBookings, { status, limit: 10 })

  return (
    <>
      <PageHeader title="My bookings" />
      <Tabs options={bookingTabs} value={status} onChange={(v) => setSp({ tab: v }, { replace: true })} className="mb-6" />
      <ErrorBox error={list.error} />
      {list.isPending ? (
        <PageSpinner />
      ) : list.items.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {list.items.map((b) => (
            <Link key={b.id} to={`/account/bookings/${b.ref}`} className="group relative block aspect-[16/9] overflow-hidden rounded-3xl bg-field">
              {b.hotel?.img && <img src={b.hotel.img} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute left-4 top-4">
                <StatusBadge status={b.status} />
              </div>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <p className="truncate text-lg font-bold">{b.hotel?.name}</p>
                <div className="mt-1 flex items-center justify-between text-sm text-white/90">
                  <span>
                    {fmtDate(b.checkIn)} – {fmtDate(b.checkOut)} · {b.room}
                  </span>
                  <span className="font-bold text-white">{tsh(b.total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="Nothing here yet" action={<Button to="/search">Find a stay</Button>}>
          {bookingTabs.find((t) => t.value === status)?.label} bookings will appear here.
        </Empty>
      )}
      <LoadMore query={list} />
    </>
  )
}
