import api from './api'

function getErrorMessage(error, fallback = 'Request failed') {
  return error?.response?.data?.message || error?.message || fallback
}

export const authApi = {
  login: (payload) => api.post('/auth/admin/login', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (payload) => api.patch('/auth/change-password', payload),
  updateProfile: (payload) => api.patch('/auth/admin/profile', payload),
}

export const productsApi = {
  list: (params) => api.get('/admin/products', { params }),
  get: (id) => api.get(`/admin/products/${id}`),
  create: (payload) => api.post('/admin/products', payload),
  update: (id, payload) => api.put(`/admin/products/${id}`, payload),
  archive: (id) => api.patch(`/admin/products/${id}/archive`),
  remove: (id) => api.delete(`/admin/products/${id}`),
  inventory: () => api.get('/admin/inventory'),
  adjustStock: (id, payload) => api.patch(`/admin/products/${id}/stock`, payload),
  patchFlags: (id, payload) => api.patch(`/admin/products/${id}/flags`, payload),
  setSoldOut: (id, soldOut) => api.patch(`/admin/products/${id}/sold-out`, { soldOut }),
}

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/admin/categories', payload),
  update: (id, payload) => api.put(`/admin/categories/${id}`, payload),
  remove: (id) => api.delete(`/admin/categories/${id}`),
}

export const familiesApi = {
  list: () => api.get('/fragrance-families'),
  create: (payload) => api.post('/admin/fragrance-families', payload),
  update: (id, payload) => api.put(`/admin/fragrance-families/${id}`, payload),
  remove: (id) => api.delete(`/admin/fragrance-families/${id}`),
}

export const ordersApi = {
  list: (params) => api.get('/admin/orders', { params }),
  get: (id) => api.get(`/admin/orders/${id}`),
  summary: () => api.get('/admin/orders/summary'),
  updateStatus: (id, payload) => api.patch(`/admin/orders/${id}/status`, payload),
  updatePayment: (id, payload) => api.patch(`/admin/orders/${id}/payment-status`, payload),
}

export const customersApi = {
  list: () => api.get('/admin/customers'),
}

export const couponsApi = {
  list: () => api.get('/admin/coupons'),
  create: (payload) => api.post('/admin/coupons', payload),
  update: (id, payload) => api.put(`/admin/coupons/${id}`, payload),
  remove: (id) => api.delete(`/admin/coupons/${id}`),
}

export const reviewsApi = {
  list: (params) => api.get('/admin/reviews', { params }),
  moderate: (id, payload) => api.patch(`/admin/reviews/${id}`, payload),
}

export const bannersApi = {
  list: () => api.get('/admin/banners'),
  create: (payload) => api.post('/admin/banners', payload),
  update: (id, payload) => api.put(`/admin/banners/${id}`, payload),
  remove: (id) => api.delete(`/admin/banners/${id}`),
}

export const contentApi = {
  dashboard: () => api.get('/admin/dashboard'),
  settings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.put('/admin/settings', payload),
  newsletter: () => api.get('/admin/newsletter'),
  inquiries: () => api.get('/admin/inquiries'),
  updateInquiry: (id, payload) => api.patch(`/admin/inquiries/${id}`, payload),
  activity: () => api.get('/admin/activity'),
  uploadImage: (file, slot = 'product') => {
    const form = new FormData()
    form.append('image', file)
    form.append('slot', slot)
    return api.post('/admin/uploads', form)
  },
  getHomepage: () => api.get('/admin/homepage'),
  updateHomepage: (payload) => api.put('/admin/homepage', payload),
}

export { getErrorMessage }
