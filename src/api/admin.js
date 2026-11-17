// Hotel back office (/admin/hotels/:hotelId/...). The server checks the caller's role at the hotel.
import { request } from './client'

const h = (hotelId, path = '') => `/admin/hotels/${hotelId}${path}`

export const createHotel = (input) => request('/admin/hotels', { method: 'POST', body: input })
export const getHotel = (hotelId) => request(h(hotelId))
export const updateHotel = (hotelId, input) => request(h(hotelId), { method: 'PATCH', body: input })
export const submitHotel = (hotelId) => request(h(hotelId, '/submit'), { method: 'POST' })
export const getDashboard = (hotelId, range) => request(h(hotelId, '/dashboard'), { query: range })

/** Uploads an image (≤ the server's UPLOAD_MAX_MB) and returns { url, key, size, contentType }. */
export function uploadImage(hotelId, file) {
  const form = new FormData()
  form.append('file', file)
  return request(h(hotelId, '/uploads'), { method: 'POST', form })
}

// bookings
export const getBookings = (hotelId, params) => request(h(hotelId, '/bookings'), { query: params })
export const getBooking = (hotelId, ref) => request(h(hotelId, `/bookings/${ref}`))
export const checkIn = (hotelId, ref) => request(h(hotelId, `/bookings/${ref}/check-in`), { method: 'POST' })
export const checkOut = (hotelId, ref) => request(h(hotelId, `/bookings/${ref}/check-out`), { method: 'POST' })
export const cancelBooking = (hotelId, ref, reason) => request(h(hotelId, `/bookings/${ref}/cancel`), { method: 'POST', body: { reason } })
/** input: { reason, amount?, paymentId? } — amount empty refunds everything refundable. */
export const refundBooking = (hotelId, ref, input) => request(h(hotelId, `/bookings/${ref}/refund`), { method: 'POST', body: input })

// rooms and rates
export const getRooms = (hotelId) => request(h(hotelId, '/rooms'))
export const createRoom = (hotelId, input) => request(h(hotelId, '/rooms'), { method: 'POST', body: input })
export const updateRoom = (hotelId, roomId, input) => request(h(hotelId, `/rooms/${roomId}`), { method: 'PATCH', body: input })
export const deleteRoom = (hotelId, roomId) => request(h(hotelId, `/rooms/${roomId}`), { method: 'DELETE' })
export const getRates = (hotelId, roomId, range) => request(h(hotelId, `/rooms/${roomId}/rates`), { query: range })
/** input: { from, to, price?, closed, reset } */
export const setRates = (hotelId, roomId, input) => request(h(hotelId, `/rooms/${roomId}/rates`), { method: 'PUT', body: input })

// money
export const getPayments = (hotelId, params) => request(h(hotelId, '/payments'), { query: params })
export const refundPayment = (hotelId, paymentId, input) => request(h(hotelId, `/payments/${paymentId}/refund`), { method: 'POST', body: input })
export const getRefunds = (hotelId, params) => request(h(hotelId, '/refunds'), { query: params })
export const getPayouts = (hotelId, params) => request(h(hotelId, '/payouts'), { query: params })

// reviews
export const getReviews = (hotelId, params) => request(h(hotelId, '/reviews'), { query: params })
export const replyToReview = (hotelId, reviewId, reply) => request(h(hotelId, `/reviews/${reviewId}/reply`), { method: 'POST', body: { reply } })

// staff
export const getStaff = (hotelId) => request(h(hotelId, '/staff'))
export const inviteStaff = (hotelId, email, role) => request(h(hotelId, '/staff'), { method: 'POST', body: { email, role } })
export const changeStaffRole = (hotelId, userId, role) => request(h(hotelId, `/staff/${userId}`), { method: 'PATCH', body: { role } })
export const removeStaff = (hotelId, userId) => request(h(hotelId, `/staff/${userId}`), { method: 'DELETE' })
export const withdrawInvitation = (hotelId, invitationId) => request(h(hotelId, `/invitations/${invitationId}`), { method: 'DELETE' })
