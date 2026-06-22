/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

export type CourseTrainerResponse = {
  courseTrainerId: number
  courseId: number
  courseTitle: string
  trainerId: number
  trainerFullName: string
  trainerEmail: string
  assignedAt: string
}

export type AssignTrainerRequest = {
  courseId: number
  trainerId: number
}
