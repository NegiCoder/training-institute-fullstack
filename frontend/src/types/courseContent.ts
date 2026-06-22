/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import type { ContentType } from '@/types/enums'

export type CourseContentResponse = {
  courseContentId: number
  courseId: number
  courseTitle: string
  moduleName: string
  contentType: ContentType
  urlOrPath: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export type CreateCourseContentRequest = {
  courseId: number
  moduleName: string
  contentType: ContentType
  urlOrPath: string
  sortOrder: number
  isActive: boolean
}

export type UpdateCourseContentRequest = {
  moduleName: string
  contentType: ContentType
  urlOrPath: string
  sortOrder: number
  isActive: boolean
}
