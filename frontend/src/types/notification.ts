/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

export type NotificationResponse = {
  notificationId: number
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export type NotificationUnreadCount = {
  unreadCount: number
}

export const NotificationTypes = {
  CourseCompleted: 'CourseCompleted',
  CertificateIssued: 'CertificateIssued',
} as const
