/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import type { UserRole } from '@/types/enums'

export type RegisterRequest = {
  fullName: string
  email: string
  password: string
  role: UserRole
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  userId: number
  fullName: string
  email: string
  role: string
  token: string
}

export type TrainerListItem = {
  userId: number
  fullName: string
  email: string
}
