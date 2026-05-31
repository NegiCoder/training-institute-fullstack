import { apiClient } from '@/services/apiClient'
import type {
  CourseResponse,
  CourseSearchRequest,
  CreateCourseRequest,
  PagedResponse,
  UpdateCourseRequest,
} from '@/types'

export const courseService = {
  async getAll(): Promise<CourseResponse[]> {
    const response = await apiClient.get<CourseResponse[]>('/api/Courses')
    return response.data
  },

  async search(request: CourseSearchRequest): Promise<PagedResponse<CourseResponse>> {
    const response = await apiClient.get<PagedResponse<CourseResponse>>(
      '/api/Courses/search',
      {
        params: request,
      },
    )
    return response.data
  },

  async getById(courseId: number): Promise<CourseResponse> {
    const response = await apiClient.get<CourseResponse>(`/api/Courses/${courseId}`)
    return response.data
  },

  async create(request: CreateCourseRequest): Promise<CourseResponse> {
    const response = await apiClient.post<CourseResponse>('/api/Courses', request)
    return response.data
  },

  async update(
    courseId: number,
    request: UpdateCourseRequest,
  ): Promise<CourseResponse> {
    const response = await apiClient.put<CourseResponse>(
      `/api/Courses/${courseId}`,
      request,
    )
    return response.data
  },

  async delete(courseId: number): Promise<void> {
    await apiClient.delete(`/api/Courses/${courseId}`)
  },
}
