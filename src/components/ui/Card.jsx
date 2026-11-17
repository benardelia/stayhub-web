export default function Card({ className = '', children, ...rest }) {
  return (
    <div className={`rounded-3xl border border-line bg-card p-5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

/** A label/value row for summaries. */
export function Row({ label, value, bold }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className={bold ? 'font-bold' : 'text-muted'}>{label}</span>
      <span className={`text-right ${bold ? 'font-extrabold text-primary' : 'font-semibold'}`}>{value}</span>
    </div>
  )
}

export function Stat({ label, value, hint }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  )
}
