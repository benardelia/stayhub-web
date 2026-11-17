// Back-office layout: a sidebar of sections and the page. Used by the hotel admin and the platform admin.
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Logo } from '../site/Navbar'
import { useAuth } from '../../auth/useAuth'

export default function Shell({ title, subtitle, nav, header }) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const link = ({ isActive }) =>
    `block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-soft text-primary' : 'text-muted hover:bg-field hover:text-ink'}`

  const sidebar = (
    <div className="flex h-full flex-col gap-6">
      <Logo />
      <div>
        <p className="truncate font-bold">{title}</p>
        {subtitle}
      </div>
      {header}
      <nav className="space-y-1">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={link} onClick={() => setOpen(false)}>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-line pt-4 text-sm">
        <NavLink to="/" className={link}>
          ← Back to {`site`}
        </NavLink>
        <p className="truncate px-3.5 pt-2 text-xs text-muted">{user?.email}</p>
        <button type="button" onClick={signOut} className="px-3.5 py-1 text-sm font-semibold text-muted hover:text-ink">
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="hidden border-r border-line bg-card p-5 md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">{sidebar}</aside>
      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3 md:hidden">
        <Logo />
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-full bg-field px-4 py-2 text-sm font-semibold">
          Menu
        </button>
      </div>
      {open && <div className="border-b border-line bg-card p-5 md:hidden">{sidebar}</div>}
      <main className="min-w-0 px-5 py-8 md:px-10">
        <Outlet />
      </main>
    </div>
  )
}
