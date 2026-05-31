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
