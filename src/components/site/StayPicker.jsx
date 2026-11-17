// Dates + guests inputs shared by the home search, the search page and the hotel page.
import { addDays, today } from '../../lib/dates'
import { Input } from '../ui/Field'

export default function StayPicker({ value, onChange, compact }) {
  const set = (k) => (e) => {
    const next = { ...value, [k]: k === 'adults' || k === 'children' ? Number(e.target.value) : e.target.value }
    if (k === 'checkIn' && next.checkOut && next.checkOut <= next.checkIn) next.checkOut = addDays(next.checkIn, 1)
    onChange(next)
  }
  return (
    <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-4'}`}>
      <Input label="Check in" type="date" min={today()} value={value.checkIn} onChange={set('checkIn')} />
      <Input label="Check out" type="date" min={addDays(value.checkIn || today(), 1)} value={value.checkOut} onChange={set('checkOut')} />
      <Input label="Adults" type="number" min="1" max="20" value={value.adults} onChange={set('adults')} />
      <Input label="Children" type="number" min="0" max="20" value={value.children} onChange={set('children')} />
    </div>
  )
}
