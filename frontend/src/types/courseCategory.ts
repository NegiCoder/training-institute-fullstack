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
