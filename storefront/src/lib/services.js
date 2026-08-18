import api from './api'

function getErrorMessage(error, fallback = 'Request failed') {
  return error?.response?.data?.message || error?.message || fallback
}

export const storeApi = {
  products: (params) => api.get('/products', { params }),
  productBySlug: (slug) => api.get(`/products/slug/${slug}`),
  categories: () => api.get('/categories'),
  families: () => api.get('/fragrance-families'),
  banners: () => api.get('/banners'),
  homepage: () => api.get('/homepage'),
  settings: () => api.get('/settings'),
  reviews: (params) => api.get('/reviews', { params }),
  validateCoupon: (payload) => api.post('/coupons/validate', payload),
  placeOrder: (payload) => api.post('/orders', payload),
  trackOrder: (payload) => api.post('/orders/track', payload),
  newsletter: (email) => api.post('/newsletter', { email }),
  contact: (payload) => api.post('/contact', payload),
}

export const customerAuthApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  myOrders: () => api.get('/account/orders'),
}

export { getErrorMessage }
