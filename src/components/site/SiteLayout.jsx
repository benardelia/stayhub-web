import { Outlet } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 md:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
