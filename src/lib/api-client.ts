import axios from 'axios'

/**
 * Browser-side HTTP client. Attaches the stored JWT to each request.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('borel-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    // Laisse axios choisir le bon Content-Type pour les uploads (FormData)
    if (config.data instanceof FormData) delete config.headers['Content-Type']
  }
  return config
})

const PROTECTED = ['/account', '/admin', '/checkout']

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const code = error.response?.data?.error?.code

    if (status === 401 && code === 'AUTH_ERROR' && typeof window !== 'undefined') {
      // Session invalide/expirée : on purge la session locale
      window.localStorage.removeItem('borel-token')
      window.localStorage.removeItem('borel-auth')
      const path = window.location.pathname
      if (PROTECTED.some((p) => path.startsWith(p))) {
        const redirect = encodeURIComponent(path + window.location.search)
        window.location.href = `/login?session=expired&redirect=${redirect}`
      }
    }

    const message =
      error.response?.data?.error?.message ?? error.message ?? 'Erreur réseau'
    return Promise.reject(new Error(message))
  },
)
