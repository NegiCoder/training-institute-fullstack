import { apiClient } from '@/services/apiClient'
import type {
  CreateEnrollmentRequest,
  EnrollmentResponse,
  EnrollmentSearchRequest,
  PagedResponse,
  UpdateEnrollmentStatusRequest,
} from '@/types'

export const enrollmentService = {
  async createMyEnrollment(
    request: CreateEnrollmentRequest,
  ): Promise<EnrollmentResponse> {
    const response = await apiClient.post<EnrollmentResponse>(
      '/api/Enrollments/me',
      request,
    )
    return response.data
  },

  async getMyEnrollments(): Promise<EnrollmentResponse[]> {
    const response = await apiClient.get<EnrollmentResponse[]>('/api/Enrollments/me')
    return response.data
  },

  async getTrainerEnrollments(): Promise<EnrollmentResponse[]> {
    const response = await apiClient.get<EnrollmentResponse[]>(
      '/api/Enrollments/trainer/me',
    )
    return response.data
  },

  async getAllEnrollments(): Promise<EnrollmentResponse[]> {
    const response = await apiClient.get<EnrollmentResponse[]>('/api/Enrollments')
    return response.data
  },

  async searchEnrollments(
    request: EnrollmentSearchRequest,
  ): Promise<PagedResponse<EnrollmentResponse>> {
    const response = await apiClient.get<PagedResponse<EnrollmentResponse>>(
      '/api/Enrollments/search',
      {
        params: request,
      },
    )
    return response.data
  },

  async getEnrollmentById(courseEnrollmentId: number): Promise<EnrollmentResponse> {
    const response = await apiClient.get<EnrollmentResponse>(
      `/api/Enrollments/${courseEnrollmentId}`,
    )
    return response.data
  },

  async updateStatus(
    courseEnrollmentId: number,
    request: UpdateEnrollmentStatusRequest,
  ): Promise<EnrollmentResponse> {
    const response = await apiClient.put<EnrollmentResponse>(
      `/api/Enrollments/${courseEnrollmentId}/status`,
      request,
    )
    return response.data
  },
}
