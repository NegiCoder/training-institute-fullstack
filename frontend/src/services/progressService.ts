/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { apiClient } from '@/services/apiClient'
import type { MarkModuleCompleteRequest, StudentModuleProgressResponse } from '@/types'

export const progressService = {
  async markModuleComplete(
    request: MarkModuleCompleteRequest,
  ): Promise<StudentModuleProgressResponse> {
    const response = await apiClient.post<StudentModuleProgressResponse>(
      '/api/StudentModuleProgress/complete',
      request,
    )
    return response.data
  },

  async getProgressByEnrollmentId(
    courseEnrollmentId: number,
  ): Promise<StudentModuleProgressResponse[]> {
    const response = await apiClient.get<StudentModuleProgressResponse[]>(
      `/api/StudentModuleProgress/enrollment/${courseEnrollmentId}`,
    )
    return response.data
  },
}
