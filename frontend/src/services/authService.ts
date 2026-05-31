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

  async getTrainers(): Promise<TrainerListItem[]> {
    const response = await apiClient.get<TrainerListItem[]>('/api/auth/trainers')
    return response.data
  },
}
