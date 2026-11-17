import { Logo } from '../../components/site/Navbar'

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <div className="rounded-3xl border border-line bg-card p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
