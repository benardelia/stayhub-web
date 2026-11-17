// /admin/hotels/:hotelId/* — loads the hotel and my role there, then renders the section in the shell.
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getHotel } from '../../api/admin'
import { getMyHotels } from '../../api/guest'
import { useAuth } from '../../auth/useAuth'
import { adminNav, roles } from '../../content'
import { HotelCtx } from '../../components/admin/HotelContext'
import Shell from '../../components/admin/Shell'
import { StatusBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import { ErrorBox } from '../../components/ui/States'
import Button from '../../components/ui/Button'

export default function HotelLayout() {
  const { hotelId } = useParams()
  const { isPlatformAdmin } = useAuth()
  const hotel = useQuery({ queryKey: ['admin-hotel', hotelId], queryFn: () => getHotel(hotelId) })
  const mine = useQuery({ queryKey: ['my-hotels'], queryFn: getMyHotels })

  if (hotel.isPending || mine.isPending) return <PageSpinner />
  if (hotel.error) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <ErrorBox error={hotel.error} />
        <Button to="/admin" variant="outline" className="mt-6">
          Back to your properties
        </Button>
      </div>
    )
  }

  const role = isPlatformAdmin ? 'platform_admin' : (mine.data?.find((m) => m.hotelId === hotelId)?.role ?? 'hotel_staff')
  const isAdmin = role !== 'hotel_staff'
  const nav = adminNav.filter((n) => isAdmin || !n.adminOnly).map((n) => ({ ...n, to: `/admin/hotels/${hotelId}${n.to ? `/${n.to}` : ''}` }))

  return (
    <HotelCtx.Provider value={{ hotelId, hotel: hotel.data, role, isAdmin }}>
      <Shell
        title={hotel.data.name}
        subtitle={
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={hotel.data.status} />
            <span className="text-xs text-muted">{roles[role]}</span>
          </div>
        }
        nav={[{ label: '← All properties', to: '/admin', end: true }, ...nav]}
      />
    </HotelCtx.Provider>
  )
}
