/** Read-only stars, or a picker when onChange is given. */
export default function Stars({ value = 0, onChange, size = 'text-base' }) {
  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) =>
        onChange ? (
          <button key={i} type="button" onClick={() => onChange(i)} className={i <= value ? 'text-star' : 'text-line'} aria-label={`${i} stars`}>
            ★
          </button>
        ) : (
          <span key={i} className={i <= Math.round(value) ? 'text-star' : 'text-line'}>
            ★
          </span>
        ),
      )}
    </span>
  )
}
