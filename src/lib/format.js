// Formatting helpers. Money is whole Tanzanian shillings (the API's int64 TZS).

const group = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/** 390000 → "TSh 390,000" */
export const tsh = (n) => (n == null ? '—' : `TSh ${group(n)}`)

/** 390000 → "TSh 390K", 1500000 → "TSh 1.5M" (rounded, for tight spaces). */
export const tshShort = (n) =>
  n >= 1_000_000 ? `TSh ${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `TSh ${Math.round(n / 1000)}K`

/** Basis points → percent: 1000 → "10%", 1850 → "18.5%". */
export const pct = (bps) => (bps == null ? '—' : `${(bps / 100).toFixed(bps % 100 ? 1 : 0)}%`)

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`

/** A stay date ("2026-04-12") or timestamp → "12 Apr 2026". Stay dates are calendar days: no time zone shift. */
export const fmtDate = (s) => {
  if (!s) return '—'
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : new Date(s)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: s.length === 10 ? 'UTC' : undefined })
}

export const fmtDateTime = (s) =>
  s ? new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export const guests = (adults, children) =>
  [plural(adults, 'adult'), children ? plural(children, 'child', 'children') : null].filter(Boolean).join(' · ')

export const fullName = (u) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email : '')
