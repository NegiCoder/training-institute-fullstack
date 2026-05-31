import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '@/types'

type AuthUser = {
  userId: number
  fullName: string
  email: string
  role: string
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (response: AuthResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (response) =>
        set({
          user: {
            userId: response.userId,
            fullName: response.fullName,
            email: response.email,
            role: response.role,
          },
          token: response.token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'training-institute-auth',
    },
  ),
)
