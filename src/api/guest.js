// The signed-in guest: profile, bookings, payments, favourites, saved payment methods, reviews.
import { request } from './client'

export const getMe = () => request('/me')
export const updateMe = (input) => request('/me', { method: 'PATCH', body: input })
export const deleteMe = () => request('/me', { method: 'DELETE' })
export const getMyHotels = () => request('/me/hotels')

// bookings
export const getMyBookings = (params) => request('/me/bookings', { query: params })
export const getBooking = (ref) => request(`/bookings/${ref}`)
/** input: { hotelId, roomTypeId, checkIn, checkOut, adults, children } */
export const createBooking = (input, idempotencyKey) => request('/bookings', { method: 'POST', body: input, idempotencyKey })
export const cancelBooking = (ref, reason) => request(`/bookings/${ref}/cancel`, { method: 'POST', body: { reason } })
export const reviewBooking = (ref, rating, comment) => request(`/bookings/${ref}/review`, { method: 'POST', body: { rating, comment } })

// payments
export const getBookingPayments = (ref) => request(`/bookings/${ref}/payments`)
/** input: { method, phone?, paymentMethodId?, returnUrl? } → Payment with nextAction */
export const startPayment = (ref, input, idempotencyKey) =>
  request(`/bookings/${ref}/payments`, { method: 'POST', body: input, idempotencyKey })
export const confirmPayment = (ref, paymentId) => request(`/bookings/${ref}/payments/${paymentId}/confirm`, { method: 'POST' })

// favourites
export const getFavourites = (params) => request('/me/favourites', { query: params })
export const isFavourite = (hotelId) => request(`/me/favourites/${hotelId}`)
export const saveFavourite = (hotelId) => request(`/me/favourites/${hotelId}`, { method: 'PUT' })
export const removeFavourite = (hotelId) => request(`/me/favourites/${hotelId}`, { method: 'DELETE' })

// saved payment methods
export const getPaymentMethods = () => request('/me/payment-methods')
export const deletePaymentMethod = (id) => request(`/me/payment-methods/${id}`, { method: 'DELETE' })
export const makeDefaultPaymentMethod = (id) => request(`/me/payment-methods/${id}/default`, { method: 'POST' })
