import { statuses } from '../../content'

const tones = {
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  info: 'bg-primary/12 text-primary',
  neutral: 'bg-field text-muted',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>
}

/** A booking, payment, refund or hotel status, labelled from content.statuses. */
export function StatusBadge({ status }) {
  const [label, tone] = statuses[status] ?? [status, 'neutral']
  return <Badge tone={tone}>{label}</Badge>
}
