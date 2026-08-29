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
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error?.message ?? error.message ?? 'Erreur réseau'
    return Promise.reject(new Error(message))
  },
)
