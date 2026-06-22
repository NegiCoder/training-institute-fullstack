/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { apiClient } from '@/services/apiClient'
import type {
  CoursePricingResponse,
  CreateCoursePricingRequest,
  UpdateCoursePricingRequest,
} from '@/types'

export const coursePricingService = {
  async getByCourseId(courseId: number): Promise<CoursePricingResponse[]> {
    const response = await apiClient.get<CoursePricingResponse[]>(
      `/api/CoursePricings/course/${courseId}`,
    )
    return response.data
  },

  async getById(coursePricingId: number): Promise<CoursePricingResponse> {
    const response = await apiClient.get<CoursePricingResponse>(
      `/api/CoursePricings/${coursePricingId}`,
    )
    return response.data
  },

  async create(request: CreateCoursePricingRequest): Promise<CoursePricingResponse> {
    const response = await apiClient.post<CoursePricingResponse>(
      '/api/CoursePricings',
      request,
    )
    return response.data
  },

  async update(
    coursePricingId: number,
    request: UpdateCoursePricingRequest,
  ): Promise<CoursePricingResponse> {
    const response = await apiClient.put<CoursePricingResponse>(
      `/api/CoursePricings/${coursePricingId}`,
      request,
    )
    return response.data
  },

  async delete(coursePricingId: number): Promise<void> {
    await apiClient.delete(`/api/CoursePricings/${coursePricingId}`)
  },
}
