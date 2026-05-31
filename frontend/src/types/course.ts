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
  isOpenAccess: boolean
  isFeatured: boolean
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
  isOpenAccess: boolean
  isFeatured: boolean
}

export type UpdateCourseRequest = CreateCourseRequest

export type CourseSearchRequest = {
  searchTerm?: string
  courseCategoryId?: number
  level?: string
  mode?: string
  status?: CourseStatus
  isOpenAccess?: boolean
  isFeatured?: boolean
  pageNumber: number
  pageSize: number
}
