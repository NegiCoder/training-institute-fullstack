export type ReportsOverviewResponse = {
  totalStudents: number
  totalTrainers: number
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalCertificates: number
  overallCompletionRate: number
}

export type CoursePerformanceResponse = {
  courseId: number
  courseTitle: string
  categoryName: string
  status: string
  isFree: boolean
  currentPrice?: number | null
  totalEnrollments: number
  assignedCount: number
  inProgressCount: number
  completedCount: number
  cancelledCount: number
  certificatesIssued: number
  completionRate: number
  certificateRate: number
  averageProgressPercentage: number
}

export type TopCourseResponse = {
  courseId: number
  courseTitle: string
  categoryName: string
  count: number
}

export type EnrollmentTrendPointResponse = {
  year: number
  month: number
  label: string
  enrollmentCount: number
}

export type TopCourseMetric = 'enrollments' | 'certificates'

export type TrainerPerformanceResponse = {
  trainerId: number
  trainerName: string
  email: string
  coursesAssigned: number
  totalStudents: number
  completedStudents: number
  certificatesIssued: number
  averageCompletionRate: number
}

export type CategoryPerformanceResponse = {
  categoryId: number
  categoryName: string
  totalCourses: number
  totalEnrollments: number
  completedEnrollments: number
  certificatesIssued: number
  averageCompletionRate: number
}

export type TopStudentResponse = {
  studentId: number
  studentName: string
  email: string
  certificatesEarned: number
  completedCourses: number
}

export type IdleStudentResponse = {
  studentId: number
  studentName: string
  email: string
  lastEnrollmentAt: string | null
  daysSinceLastEnrollment: number
  totalEnrollments: number
}

export type StudentEngagementResponse = {
  topByCertificates: TopStudentResponse[]
  idleStudents: IdleStudentResponse[]
}
