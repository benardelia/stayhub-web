/** Pill tabs. options: [{ value, label }] */
export default function Tabs({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`h-9 rounded-full px-4 text-sm font-semibold transition ${value === o.value ? 'bg-primary text-white' : 'bg-field text-ink hover:bg-line'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
