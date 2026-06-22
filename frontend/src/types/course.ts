/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import type { CourseStatus } from '@/types/enums'

export type CourseResponse = {
  courseId: number
  courseCategoryId: number
  categoryName: string
  title: string
  description?: string | null
  level: string
  mode: string
  duration: string
  status: CourseStatus
  isFeatured: boolean
  isFree: boolean
  currentPrice?: number | null
  createdAt: string
  updatedAt?: string | null
}

export type CreateCourseRequest = {
  courseCategoryId: number
  title: string
  description?: string | null
  level: string
  mode: string
  duration: string
  status: CourseStatus
  isFeatured: boolean
}

export type UpdateCourseRequest = CreateCourseRequest

export type CourseSearchRequest = {
  searchTerm?: string
  courseCategoryId?: number
  level?: string
  mode?: string
  status?: CourseStatus
  isFeatured?: boolean
  isFree?: boolean
  pageNumber: number
  pageSize: number
}
