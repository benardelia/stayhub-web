import { createContext, useContext } from 'react'

/** The hotel being managed: { hotelId, hotel, role, isAdmin }. Set by AdminShell. */
export const HotelCtx = createContext(null)
export const useHotelCtx = () => useContext(HotelCtx)
