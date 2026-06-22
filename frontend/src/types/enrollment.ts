/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import type { EnrollmentStatus } from '@/types/enums'

export type CreateEnrollmentRequest = {
  courseId: number
  startDate: string
  endDate: string
}

export type UpdateEnrollmentStatusRequest = {
  status: EnrollmentStatus
}

export type EnrollmentResponse = {
  courseEnrollmentId: number
  studentId: number
  studentName: string
  courseId: number
  courseTitle: string
  startDate: string
  endDate: string
  status: EnrollmentStatus
  progressPercentage: number
  completedAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

export type EnrollmentSearchRequest = {
  searchTerm?: string
  studentId?: number
  courseId?: number
  status?: EnrollmentStatus
  startDateFrom?: string
  startDateTo?: string
  pageNumber: number
  pageSize: number
}
