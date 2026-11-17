// Stay dates are plain calendar days in "YYYY-MM-DD" form, exactly what the API takes and returns.

const pad = (n) => String(n).padStart(2, '0')

/** Local calendar day of a Date → "YYYY-MM-DD". */
export const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const today = () => isoDay(new Date())

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return isoDay(d)
}

export const nightsBetween = (a, b) =>
  Math.max(0, Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000))

/** A week from today, four nights — the same default as the mobile app. */
export const defaultStay = () => {
  const checkIn = addDays(today(), 7)
  return { checkIn, checkOut: addDays(checkIn, 4) }
}

/** First and last day of the month containing iso. */
export const monthRange = (iso) => {
  const d = new Date(`${iso}T00:00:00`)
  return { from: isoDay(new Date(d.getFullYear(), d.getMonth(), 1)), to: isoDay(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }
}
