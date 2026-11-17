// A stay in the URL: ?checkIn=&checkOut=&adults=&children=

/** Reads a stay from URL search params, falling back to defaults. */
export function stayFromParams(sp, fallback) {
  return {
    checkIn: sp.get('checkIn') || fallback.checkIn,
    checkOut: sp.get('checkOut') || fallback.checkOut,
    adults: Number(sp.get('adults') || 2),
    children: Number(sp.get('children') || 0),
  }
}

export const stayQuery = (s) => new URLSearchParams({ checkIn: s.checkIn, checkOut: s.checkOut, adults: s.adults, children: s.children }).toString()
