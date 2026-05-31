export type MarkModuleCompleteRequest = {
  courseEnrollmentId: number
  courseContentId: number
}

export type StudentModuleProgressResponse = {
  studentModuleProgressId: number
  courseEnrollmentId: number
  courseContentId: number
  moduleName: string
  completedAt: string
  progressPercentage: number
}
