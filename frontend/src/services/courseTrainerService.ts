/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { apiClient } from '@/services/apiClient'
import type { AssignTrainerRequest, CourseTrainerResponse } from '@/types'

export const courseTrainerService = {
  async getTrainersByCourseId(courseId: number): Promise<CourseTrainerResponse[]> {
    const response = await apiClient.get<CourseTrainerResponse[]>(
      `/api/CourseTrainers/course/${courseId}`,
    )
    return response.data
  },

  async getCoursesByTrainerId(trainerId: number): Promise<CourseTrainerResponse[]> {
    const response = await apiClient.get<CourseTrainerResponse[]>(
      `/api/CourseTrainers/trainer/${trainerId}`,
    )
    return response.data
  },

  async assignTrainer(request: AssignTrainerRequest): Promise<CourseTrainerResponse> {
    const response = await apiClient.post<CourseTrainerResponse>(
      '/api/CourseTrainers',
      request,
    )
    return response.data
  },

  async removeTrainer(courseTrainerId: number): Promise<void> {
    await apiClient.delete(`/api/CourseTrainers/${courseTrainerId}`)
  },
}
