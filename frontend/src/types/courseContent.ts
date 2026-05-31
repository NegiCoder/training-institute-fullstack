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
