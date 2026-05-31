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
