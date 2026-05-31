import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseTrainerService } from '@/services/courseTrainerService'
import { enrollmentService } from '@/services/enrollmentService'
import { useAuthStore } from '@/store/authStore'
import type { CourseTrainerResponse, EnrollmentResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function TrainerDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [assignedCourses, setAssignedCourses] = useState<CourseTrainerResponse[]>(
    [],
  )
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')
        const [courses, enrollmentRows] = await Promise.all([
          courseTrainerService.getCoursesByTrainerId(user.userId),
          enrollmentService.getTrainerEnrollments(),
        ])
        setAssignedCourses(courses)
        setEnrollments(enrollmentRows)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [user])

  const uniqueCourseCount = new Set(
    assignedCourses.map((assignment) => assignment.courseId),
  ).size

  return (
    <section className="page-card">
      <p className="eyebrow">Trainer</p>
      <h1>Trainer Dashboard</h1>
      <p className="page-text">
        Upload and manage course content, and track the students enrolled in your
        courses.
      </p>

      {isLoading && <p className="page-text">Loading dashboard...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>Assigned Courses</span>
              <strong>{uniqueCourseCount}</strong>
            </div>
            <div className="dashboard-card">
              <span>Enrolled Students</span>
              <strong>{enrollments.length}</strong>
            </div>
            <div className="dashboard-card">
              <span>Trainer</span>
              <strong>{user?.fullName ?? '-'}</strong>
            </div>
            <div className="dashboard-card">
              <span>Role</span>
              <strong>{user?.role ?? '-'}</strong>
            </div>
          </div>

          <div className="quick-link-grid">
            <Link to="/trainer/courses">My Courses</Link>
            <Link to="/trainer/modules">Manage Content</Link>
            <Link to="/trainer/students">My Students</Link>
            <Link to="/courses">Course Catalog</Link>
          </div>
        </>
      )}
    </section>
  )
}
