import logo from '../assets/logo.jpeg'

export const brand = {
  name: 'SQ Perfumes',
  shortName: 'SQ',
  logo,
  adminTitle: 'Admin Console',
}

export function formatPrice(amount) {
  const value = Number(amount || 0)
  return `Rs. ${value.toLocaleString('en-PK')}`
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
]

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded']
