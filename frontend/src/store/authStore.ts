/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '@/types'

// Ye global auth store hai - logged-in user aur token poore app me yaha se milta hai.
// persist middleware isko localStorage me save karta hai, isliye refresh par
// user logged-in hi rehta hai.

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

      // Login/register success ke baad user + token save karta hai
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

      // Logout - sab clear, user wapas guest ban jaata hai
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
