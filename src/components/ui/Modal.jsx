import { useEffect, useRef } from 'react'

/** A native <dialog>: Esc and the backdrop close it. */
export default function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-3xl border border-line bg-card p-0 text-ink backdrop:bg-black/50`}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button type="button" onClick={onClose} className="-mr-2 -mt-1 rounded-full px-2 text-2xl leading-none text-muted hover:text-ink" aria-label="Close">
              ×
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
