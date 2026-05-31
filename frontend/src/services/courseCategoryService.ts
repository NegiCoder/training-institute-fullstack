import { apiClient } from '@/services/apiClient'
import type {
  CourseCategoryResponse,
  CreateCourseCategoryRequest,
  UpdateCourseCategoryRequest,
} from '@/types'

export const courseCategoryService = {
  async getAll(): Promise<CourseCategoryResponse[]> {
    const response =
      await apiClient.get<CourseCategoryResponse[]>('/api/CourseCategories')
    return response.data
  },

  async getById(courseCategoryId: number): Promise<CourseCategoryResponse> {
    const response = await apiClient.get<CourseCategoryResponse>(
      `/api/CourseCategories/${courseCategoryId}`,
    )
    return response.data
  },

  async create(
    request: CreateCourseCategoryRequest,
  ): Promise<CourseCategoryResponse> {
    const response = await apiClient.post<CourseCategoryResponse>(
      '/api/CourseCategories',
      request,
    )
    return response.data
  },

  async update(
    courseCategoryId: number,
    request: UpdateCourseCategoryRequest,
  ): Promise<CourseCategoryResponse> {
    const response = await apiClient.put<CourseCategoryResponse>(
      `/api/CourseCategories/${courseCategoryId}`,
      request,
    )
    return response.data
  },

  async delete(courseCategoryId: number): Promise<void> {
    await apiClient.delete(`/api/CourseCategories/${courseCategoryId}`)
  },
}
