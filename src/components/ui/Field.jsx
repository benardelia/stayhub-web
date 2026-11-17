// Form controls with a label and an error line. `error` is a string (e.g. from ApiError.fields).

const control =
  'w-full rounded-xl border bg-field px-4 text-sm text-ink placeholder:text-muted outline-none transition focus:border-primary focus:bg-card'

function Wrap({ label, error, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-semibold">{label}</span>}
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  )
}

export function Input({ label, error, hint, className, ...rest }) {
  return (
    <Wrap label={label} error={error} hint={hint} className={className}>
      <input className={`${control} h-11 ${error ? 'border-danger' : 'border-line'}`} {...rest} />
    </Wrap>
  )
}

export function Textarea({ label, error, hint, className, rows = 4, ...rest }) {
  return (
    <Wrap label={label} error={error} hint={hint} className={className}>
      <textarea rows={rows} className={`${control} py-3 ${error ? 'border-danger' : 'border-line'}`} {...rest} />
    </Wrap>
  )
}

/** options: [{ value, label }] or strings. */
export function Select({ label, error, hint, className, options, placeholder, ...rest }) {
  return (
    <Wrap label={label} error={error} hint={hint} className={className}>
      <select className={`${control} h-11 ${error ? 'border-danger' : 'border-line'}`} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const { value, label: l } = typeof o === 'string' ? { value: o, label: o } : o
          return (
            <option key={value} value={value}>
              {l}
            </option>
          )
        })}
      </select>
    </Wrap>
  )
}

export function Checkbox({ label, className = '', ...rest }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 text-sm ${className}`}>
      <input type="checkbox" className="size-4 accent-primary" {...rest} />
      {label}
    </label>
  )
}
