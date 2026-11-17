// Platform administration (/platform/...): needs the platform_admin role.
import { request } from './client'

export const getHotels = (params) => request('/platform/hotels', { query: params })
export const approveHotel = (id) => request(`/platform/hotels/${id}/approve`, { method: 'POST' })
export const suspendHotel = (id) => request(`/platform/hotels/${id}/suspend`, { method: 'POST' })
export const unpublishHotel = (id) => request(`/platform/hotels/${id}/unpublish`, { method: 'POST' })
/** input: { commissionRateBps?, taxRateBps? } */
export const setHotelRates = (id, input) => request(`/platform/hotels/${id}/rates`, { method: 'PATCH', body: input })

export const getBookings = (params) => request('/platform/bookings', { query: params })
export const refundBooking = (ref, input) => request(`/platform/bookings/${ref}/refund`, { method: 'POST', body: input })

export const getPayments = (params) => request('/platform/payments', { query: params })
export const refundPayment = (id, input) => request(`/platform/payments/${id}/refund`, { method: 'POST', body: input })

export const getRefunds = (params) => request('/platform/refunds', { query: params })
/** input: { succeeded, providerReference, failureReason } */
export const completeRefund = (id, input) => request(`/platform/refunds/${id}/complete`, { method: 'POST', body: input })

export const getUsers = (params) => request('/platform/users', { query: params })
export const getUser = (id) => request(`/platform/users/${id}`)
export const disableUser = (id) => request(`/platform/users/${id}/disable`, { method: 'POST' })
export const enableUser = (id) => request(`/platform/users/${id}/enable`, { method: 'POST' })
