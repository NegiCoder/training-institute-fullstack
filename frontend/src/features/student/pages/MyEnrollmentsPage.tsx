import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { enrollmentService } from '@/services/enrollmentService'
import type { EnrollmentResponse } from '@/types'
import { EnrollmentStatus } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

function getEnrollmentStatusLabel(status: number): string {
  if (status === EnrollmentStatus.Assigned) {
    return 'Assigned'
  }

  if (status === EnrollmentStatus.InProgress) {
    return 'In Progress'
  }

  if (status === EnrollmentStatus.Completed) {
    return 'Completed'
  }

  if (status === EnrollmentStatus.Cancelled) {
    return 'Cancelled'
  }

  return 'Unknown'
}

export function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadEnrollments() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const result = await enrollmentService.getMyEnrollments()
        setEnrollments(result)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadEnrollments()
  }, [])

  return (
    <section className="page-card">
      <p className="eyebrow">Student</p>
      <h1>My Enrollments</h1>
      <p className="page-text">
        Track your enrolled courses, current status, and progress percentage.
      </p>

      {isLoading && <p className="page-text">Loading enrollments...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && enrollments.length === 0 && (
        <div className="empty-state">You are not enrolled in any courses yet.</div>
      )}

      {!isLoading && !errorMessage && enrollments.length > 0 && (
        <div className="enrollment-grid">
          {enrollments.map((enrollment) => (
            <article className="enrollment-card" key={enrollment.courseEnrollmentId}>
              <div className="course-card-header">
                <span>{getEnrollmentStatusLabel(enrollment.status)}</span>
                <strong>{enrollment.progressPercentage}%</strong>
              </div>

              <h2>{enrollment.courseTitle}</h2>
              <p>
                {new Date(enrollment.startDate).toLocaleDateString()} -{' '}
                {new Date(enrollment.endDate).toLocaleDateString()}
              </p>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${enrollment.progressPercentage}%` }}
                />
              </div>

              <Link
                className="course-link"
                to={`/student/enrollments/${enrollment.courseEnrollmentId}`}
              >
                View progress
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
