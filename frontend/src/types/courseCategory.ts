/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

export type CreateCourseCategoryRequest = {
  name: string
}

export type UpdateCourseCategoryRequest = {
  name: string
  isActive: boolean
}

export type CourseCategoryResponse = {
  courseCategoryId: number
  name: string
  isActive: boolean
}
