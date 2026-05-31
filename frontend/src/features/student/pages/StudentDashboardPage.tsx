import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { certificateService } from '@/services/certificateService'
import { enrollmentService } from '@/services/enrollmentService'
import { EnrollmentStatus, type EnrollmentResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([])
  const [certificateCount, setCertificateCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [enrollmentResult, certificateResult] = await Promise.all([
          enrollmentService.getMyEnrollments(),
          certificateService.getMyCertificates(),
        ])

        setEnrollments(enrollmentResult)
        setCertificateCount(certificateResult.length)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status !== EnrollmentStatus.Cancelled,
  ).length

  const completedEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === EnrollmentStatus.Completed,
  ).length

  const averageProgress =
    enrollments.length === 0
      ? 0
      : Math.round(
          enrollments.reduce(
            (total, enrollment) => total + enrollment.progressPercentage,
            0,
          ) / enrollments.length,
        )

  return (
    <section className="page-card">
      <p className="eyebrow">Student</p>
      <h1>Student Dashboard</h1>
      <p className="page-text">
        View enrollments, track module progress, and download certificates.
      </p>

      {isLoading && <p className="page-text">Loading dashboard...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>Active Courses</span>
              <strong>{activeEnrollments}</strong>
            </div>
            <div className="dashboard-card">
              <span>Completed Courses</span>
              <strong>{completedEnrollments}</strong>
            </div>
            <div className="dashboard-card">
              <span>Average Progress</span>
              <strong>{averageProgress}%</strong>
            </div>
            <div className="dashboard-card">
              <span>Certificates</span>
              <strong>{certificateCount}</strong>
            </div>
          </div>

          <div className="quick-link-grid">
            <Link to="/courses">Browse Courses</Link>
            <Link to="/student/profile">Update Profile</Link>
            <Link to="/student/enrollments">My Courses</Link>
            <Link to="/student/certificates">Certificates</Link>
          </div>
        </>
      )}
    </section>
  )
}
