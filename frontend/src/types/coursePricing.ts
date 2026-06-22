/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

export type CoursePricingResponse = {
  coursePricingId: number
  courseId: number
  courseTitle: string
  year: number
  price: number
  isFree: boolean
  effectiveFrom?: string | null
  effectiveTo?: string | null
  createdAt: string
  updatedAt?: string | null
}

export type CreateCoursePricingRequest = {
  courseId: number
  year: number
  price: number
  isFree: boolean
  effectiveFrom?: string | null
  effectiveTo?: string | null
}

export type UpdateCoursePricingRequest = {
  year: number
  price: number
  isFree: boolean
  effectiveFrom?: string | null
  effectiveTo?: string | null
}
