import axios from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/store/authStore'

// Poore app ka ek hi axios client - saari API calls yahi se jaati hai.
// baseURL backend ka address hai (env file se aata hai).
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: har call ke saath JWT token automatically attach ho jaata hai
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Response interceptor: agar token expire/invalid (401) ho to auto logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  },
)
