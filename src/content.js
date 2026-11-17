// ────────────────────────────────────────────────────────────────
// Single source of truth for copy and fixed lists.
// Components render this; change names, labels and options here.
// ────────────────────────────────────────────────────────────────

export const brand = {
  name: 'Estantly',
  tagline: 'Book estates instantly',
  subtitle: 'Hotels · Lodges · Resorts across Tanzania',
  supportEmail: 'support@estantly.com',
}

export const heroImage =
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=70'

export const siteNav = [
  { label: 'Explore', to: '/search' },
  { label: 'Saved', to: '/account/saved', auth: true },
  { label: 'My bookings', to: '/account/bookings', auth: true },
]

/** Property types the API accepts (validate.HotelTypes on the server). */
export const hotelTypes = ['Hotels', 'Lodges', 'Resorts', 'Apartments', 'Villas', 'Guest Houses']

/** Amenities offered as filters and as checkboxes in the hotel editor. */
export const amenities = ['Free WiFi', 'Breakfast', 'Pool', 'Beach access', 'Spa', 'Parking', 'Gym', 'Restaurant', 'Airport shuttle']

export const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price', label: 'Lowest price' },
  { value: 'rating', label: 'Top rated' },
]

export const bookingTabs = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const paymentMethods = {
  card: { label: 'Card', hint: 'Visa or Mastercard on a secure Pesapal page' },
  mpesa: { label: 'M-Pesa', hint: 'Approve the payment on your phone' },
  paypal: { label: 'PayPal', hint: 'Pay with your PayPal account' },
  apple_pay: { label: 'Apple Pay', hint: 'Pay with Apple Pay' },
}

/** Status → label and badge tone, for bookings, payments, refunds and hotels. */
export const statuses = {
  pending_payment: ['Awaiting payment', 'warning'],
  confirmed: ['Confirmed', 'success'],
  checked_in: ['Checked in', 'info'],
  checked_out: ['Completed', 'neutral'],
  cancelled: ['Cancelled', 'danger'],
  expired: ['Expired', 'neutral'],
  pending: ['Pending', 'warning'],
  succeeded: ['Succeeded', 'success'],
  failed: ['Failed', 'danger'],
  refunded: ['Refunded', 'neutral'],
  partially_refunded: ['Partly refunded', 'warning'],
  draft: ['Draft', 'neutral'],
  pending_review: ['In review', 'warning'],
  published: ['Published', 'success'],
  suspended: ['Suspended', 'danger'],
}

export const bookingStatuses = ['pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'expired']
export const paymentStatuses = ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded']
export const refundStatuses = ['pending', 'succeeded', 'failed']
export const hotelStatuses = ['draft', 'pending_review', 'published', 'suspended']

export const roles = {
  guest: 'Guest',
  platform_admin: 'Platform admin',
  hotel_admin: 'Hotel admin',
  hotel_staff: 'Hotel staff',
}

/** Hotel back-office sections. adminOnly ones need the hotel_admin role (staff can't open them). */
export const adminNav = [
  { label: 'Dashboard', to: '', end: true },
  { label: 'Bookings', to: 'bookings' },
  { label: 'Rooms & rates', to: 'rooms' },
  { label: 'Hotel profile', to: 'profile', adminOnly: true },
  { label: 'Payments', to: 'money', adminOnly: true },
  { label: 'Reviews', to: 'reviews' },
  { label: 'Staff', to: 'staff', adminOnly: true },
]

export const platformNav = [
  { label: 'Hotels', to: 'hotels' },
  { label: 'Bookings', to: 'bookings' },
  { label: 'Payments', to: 'payments' },
  { label: 'Refunds', to: 'refunds' },
  { label: 'Users', to: 'users' },
]
