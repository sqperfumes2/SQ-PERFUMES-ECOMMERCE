import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = String(original?.url || '')

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/admin/login') ||
      url.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').finally(() => {
          refreshPromise = null
        })
      }
      await refreshPromise
      return api(original)
    } catch (refreshError) {
      try {
        const { useAuthStore } = await import('../store')
        useAuthStore.getState().logout()
      } catch {
        /* ignore */
      }
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.assign('/login')
      }
      return Promise.reject(refreshError)
    }
  },
)

export default api
