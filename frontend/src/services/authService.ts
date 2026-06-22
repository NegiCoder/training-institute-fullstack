/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { apiClient } from '@/services/apiClient'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TrainerListItem,
} from '@/types'

export const authService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', request)
    return response.data
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', request)
    return response.data
  },

  async createTrainer(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/admin/create-trainer',
      request,
    )
    return response.data
  },

  async createAdmin(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/admin/create-admin',
      request,
    )
    return response.data
  },

  // Business user banata hai - sirf admin call kar sakta hai
  async createBusinessUser(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/admin/create-business-user',
      request,
    )
    return response.data
  },

  async getTrainers(): Promise<TrainerListItem[]> {
    const response = await apiClient.get<TrainerListItem[]>('/api/auth/trainers')
    return response.data
  },
}
