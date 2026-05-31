import { apiClient } from '@/services/apiClient'
import type {
  CourseContentResponse,
  CreateCourseContentRequest,
  UpdateCourseContentRequest,
} from '@/types'

export const courseContentService = {
  async getByCourseId(courseId: number): Promise<CourseContentResponse[]> {
    const response = await apiClient.get<CourseContentResponse[]>(
      `/api/CourseContents/course/${courseId}`,
    )
    return response.data
  },

  async getById(courseContentId: number): Promise<CourseContentResponse> {
    const response = await apiClient.get<CourseContentResponse>(
      `/api/CourseContents/${courseContentId}`,
    )
    return response.data
  },

  async create(request: CreateCourseContentRequest): Promise<CourseContentResponse> {
    const response = await apiClient.post<CourseContentResponse>(
      '/api/CourseContents',
      request,
    )
    return response.data
  },

  async update(
    courseContentId: number,
    request: UpdateCourseContentRequest,
  ): Promise<CourseContentResponse> {
    const response = await apiClient.put<CourseContentResponse>(
      `/api/CourseContents/${courseContentId}`,
      request,
    )
    return response.data
  },

  async delete(courseContentId: number): Promise<void> {
    await apiClient.delete(`/api/CourseContents/${courseContentId}`)
  },
}
