// Route table. Three areas share one app and one API client:
//   /            guest site (public browsing; account pages need sign-in)
//   /admin       hotel back office (any signed-in user; the API checks the role per hotel)
//   /platform    platform administration (platform_admin only)
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { RequireAuth, RequirePlatformAdmin } from './auth/guards'
import SiteLayout from './components/site/SiteLayout'

import Home from './pages/site/Home'
import Search from './pages/site/Search'
import HotelDetail from './pages/site/HotelDetail'
import Checkout from './pages/site/Checkout'
import NotFound from './pages/site/NotFound'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import MyBookings from './pages/account/MyBookings'
import BookingDetail from './pages/account/BookingDetail'
import Saved from './pages/account/Saved'
import Profile from './pages/account/Profile'

import MyHotels from './pages/admin/MyHotels'
import HotelLayout from './pages/admin/HotelLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminBookings from './pages/admin/Bookings'
import Rooms from './pages/admin/Rooms'
import HotelProfile from './pages/admin/Profile'
import Money from './pages/admin/Money'
import Reviews from './pages/admin/Reviews'
import Staff from './pages/admin/Staff'

import PlatformLayout from './pages/platform/PlatformLayout'
import PlatformHotels from './pages/platform/Hotels'
import PlatformBookings from './pages/platform/Bookings'
import PlatformPayments from './pages/platform/Payments'
import PlatformRefunds from './pages/platform/Refunds'
import Users from './pages/platform/Users'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="hotels/:id" element={<HotelDetail />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route element={<RequireAuth />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="account" element={<Profile />} />
            <Route path="account/bookings" element={<MyBookings />} />
            <Route path="account/bookings/:ref" element={<BookingDetail />} />
            <Route path="account/saved" element={<Saved />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin" element={<RequireAuth />}>
          <Route index element={<MyHotels />} />
          <Route path="hotels/:hotelId" element={<HotelLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="profile" element={<HotelProfile />} />
            <Route path="money" element={<Money />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="staff" element={<Staff />} />
          </Route>
        </Route>

        <Route path="platform" element={<RequirePlatformAdmin />}>
          <Route element={<PlatformLayout />}>
            <Route index element={<Navigate to="hotels" replace />} />
            <Route path="hotels" element={<PlatformHotels />} />
            <Route path="bookings" element={<PlatformBookings />} />
            <Route path="payments" element={<PlatformPayments />} />
            <Route path="refunds" element={<PlatformRefunds />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
