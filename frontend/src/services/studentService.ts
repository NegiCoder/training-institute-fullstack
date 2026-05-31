import { apiClient } from '@/services/apiClient'
import type {
  CreateStudentProfileRequest,
  PagedResponse,
  StudentProfileResponse,
  StudentSearchRequest,
  UpdateStudentProfileRequest,
} from '@/types'

export const studentService = {
  async createMyProfile(
    request: CreateStudentProfileRequest,
  ): Promise<StudentProfileResponse> {
    const response = await apiClient.post<StudentProfileResponse>(
      '/api/students/me',
      request,
    )
    return response.data
  },

  async getMyProfile(): Promise<StudentProfileResponse> {
    const response =
      await apiClient.get<StudentProfileResponse>('/api/students/me')
    return response.data
  },

  async updateMyProfile(
    request: UpdateStudentProfileRequest,
  ): Promise<StudentProfileResponse> {
    const response = await apiClient.put<StudentProfileResponse>(
      '/api/students/me',
      request,
    )
    return response.data
  },

  async getAllStudents(): Promise<StudentProfileResponse[]> {
    const response = await apiClient.get<StudentProfileResponse[]>('/api/students')
    return response.data
  },

  async searchStudents(
    request: StudentSearchRequest,
  ): Promise<PagedResponse<StudentProfileResponse>> {
    const response = await apiClient.get<PagedResponse<StudentProfileResponse>>(
      '/api/students/search',
      {
        params: request,
      },
    )
    return response.data
  },

  async getStudentById(studentId: number): Promise<StudentProfileResponse> {
    const response = await apiClient.get<StudentProfileResponse>(
      `/api/students/${studentId}`,
    )
    return response.data
  },
}
