// Public catalogue: hotels, rooms, quotes, destinations, reviews.
import { request } from './client'

/** params: { q, type, maxPrice, amenities[], checkIn, checkOut, adults, children, near, sort, cursor, limit } */
export const searchHotels = (params) => request('/hotels', { query: params })

/** By id or slug. */
export const getHotel = (id) => request(`/hotels/${encodeURIComponent(id)}`)

/** Room types; with dates each carries a quote and availability. */
export const getRooms = (hotelId, stay = {}) => request(`/hotels/${hotelId}/rooms`, { query: stay })

export const getReviews = (hotelId, params) => request(`/hotels/${hotelId}/reviews`, { query: params })

export const getDestinations = () => request('/destinations')

/** input: { hotelId, roomTypeId, checkIn, checkOut, adults, children } */
export const getQuote = (input) => request('/quotes', { method: 'POST', body: input })

export const getPaymentMethodsAvailable = () => request('/payment-methods').then((r) => r.methods ?? [])
