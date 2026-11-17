import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { brand, siteNav } from '../../content'
import { useAuth } from '../../auth/useAuth'
import Button from '../ui/Button'

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 text-xl font-extrabold tracking-tight ${className}`}>
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M12 3 2 11h3v9h6v-6h2v6h6v-9h3z" />
        </svg>
      </span>
      {brand.name}
    </Link>
  )
}

export default function Navbar() {
  const { signedIn, user, isPlatformAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const links = siteNav.filter((l) => !l.auth || signedIn)
  const linkCls = ({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted hover:text-ink'}`

  const account = signedIn ? (
    <>
      <NavLink to="/admin" className={linkCls} onClick={() => setOpen(false)}>
        Manage hotels
      </NavLink>
      {isPlatformAdmin && (
        <NavLink to="/platform" className={linkCls} onClick={() => setOpen(false)}>
          Platform
        </NavLink>
      )}
      <NavLink to="/account" end className={linkCls} onClick={() => setOpen(false)}>
        {user?.firstName || 'Account'}
      </NavLink>
      <Button size="sm" variant="outline" onClick={signOut}>
        Sign out
      </Button>
    </>
  ) : (
    <>
      <NavLink to="/signin" className={linkCls} onClick={() => setOpen(false)}>
        Sign in
      </NavLink>
      <Button size="sm" to="/signup" onClick={() => setOpen(false)}>
        Create account
      </Button>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls}>
              {l.label}
            </NavLink>
          ))}
          <span className="h-5 w-px bg-line" />
          {account}
        </nav>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex flex-col gap-1.5 p-2 md:hidden" aria-label="Toggle menu">
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
        </button>
      </div>
      {open && (
        <nav className="flex flex-col items-start gap-4 border-t border-line px-5 py-4 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {account}
        </nav>
      )}
    </header>
  )
}
