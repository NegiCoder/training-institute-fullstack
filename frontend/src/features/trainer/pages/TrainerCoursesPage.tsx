import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseTrainerService } from '@/services/courseTrainerService'
import { useAuthStore } from '@/store/authStore'
import type { CourseTrainerResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function TrainerCoursesPage() {
  const user = useAuthStore((state) => state.user)
  const [assignedCourses, setAssignedCourses] = useState<CourseTrainerResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadAssignedCourses() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')
        const result = await courseTrainerService.getCoursesByTrainerId(user.userId)
        setAssignedCourses(result)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadAssignedCourses()
  }, [user])

  return (
    <section className="page-card">
      <p className="eyebrow">Trainer</p>
      <h1>My Assigned Courses</h1>
      <p className="page-text">View courses assigned to your trainer account.</p>

      {isLoading && <p className="page-text">Loading assigned courses...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && assignedCourses.length === 0 && (
        <div className="empty-state">No courses assigned yet.</div>
      )}

      {!isLoading && !errorMessage && assignedCourses.length > 0 && (
        <div className="course-grid">
          {assignedCourses.map((assignment) => (
            <article className="course-card" key={assignment.courseTrainerId}>
              <div className="course-card-header">
                <span>Assigned course</span>
                <strong>#{assignment.courseId}</strong>
              </div>
              <h2>{assignment.courseTitle}</h2>
              <p>Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}</p>
              <Link className="course-link" to={`/courses/${assignment.courseId}`}>
                View public details
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
