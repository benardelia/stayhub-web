import { Link } from 'react-router'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-primary text-white hover:opacity-90',
  dark: 'bg-ink text-paper hover:opacity-85',
  outline: 'border border-line bg-card text-ink hover:bg-field',
  soft: 'bg-soft text-primary hover:opacity-85',
  ghost: 'text-primary hover:bg-soft',
  danger: 'bg-danger text-white hover:opacity-90',
  'danger-outline': 'border border-danger/40 text-danger hover:bg-danger/10',
}
const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

/** Button, or a router Link when `to` is given. */
export default function Button({ variant = 'primary', size = 'md', loading, disabled, className = '', to, children, type = 'button', ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}
