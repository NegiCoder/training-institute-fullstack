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
