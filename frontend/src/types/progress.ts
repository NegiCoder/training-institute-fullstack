/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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
