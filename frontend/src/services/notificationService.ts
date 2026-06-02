import { apiClient } from '@/services/apiClient'
import type { NotificationResponse, NotificationUnreadCount } from '@/types'

export const notificationService = {
  async getMine(unreadOnly = false, take = 20): Promise<NotificationResponse[]> {
    const response = await apiClient.get<NotificationResponse[]>('/api/notifications', {
      params: { unreadOnly, take },
    })
    return response.data
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<NotificationUnreadCount>(
      '/api/notifications/unread-count',
    )
    return response.data.unreadCount
  },

  async markAsRead(notificationId: number): Promise<void> {
    await apiClient.post(`/api/notifications/${notificationId}/read`)
  },

  async markAllRead(): Promise<number> {
    const response = await apiClient.post<{ updated: number }>(
      '/api/notifications/read-all',
    )
    return response.data.updated
  },
}
