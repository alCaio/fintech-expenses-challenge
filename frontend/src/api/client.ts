import axios from 'axios'
import { tokenStorage } from '../auth/tokenStorage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const hadToken = tokenStorage.get() !== null
    if (axios.isAxiosError(error) && error.response?.status === 401 && hadToken) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)
