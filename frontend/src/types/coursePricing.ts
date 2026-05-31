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
