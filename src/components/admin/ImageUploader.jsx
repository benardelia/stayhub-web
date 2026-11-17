// Upload images to the hotel's media store and manage an ordered list of photo URLs.
import { useRef, useState } from 'react'
import { uploadImage } from '../../api/admin'
import Button from '../ui/Button'
import { ErrorBox } from '../ui/States'

export default function ImageUploader({ hotelId, value, onChange, max = 30 }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const pick = async (e) => {
    const files = [...e.target.files].slice(0, max - value.length)
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    setError(null)
    try {
      const urls = []
      for (const f of files) urls.push((await uploadImage(hotelId, f)).url)
      onChange([...value, ...urls])
    } catch (err) {
      setError(err.status === 413 ? new Error('That image is too large.') : err)
    } finally {
      setBusy(false)
    }
  }
  const move = (i, d) => {
    const next = [...value]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl bg-field">
            <img src={url} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">COVER</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1 opacity-0 transition group-hover:opacity-100">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-2 text-white disabled:opacity-30" aria-label="Move left">
                ←
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-2 text-xs font-semibold text-white" aria-label="Remove">
                Remove
              </button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="px-2 text-white disabled:opacity-30" aria-label="Move right">
                →
              </button>
            </div>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            {busy ? 'Uploading…' : '+ Add photos'}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pick} />
      <ErrorBox error={error} className="mt-3" />
      {busy && (
        <Button variant="ghost" size="sm" loading className="mt-2">
          Uploading
        </Button>
      )}
    </div>
  )
}
