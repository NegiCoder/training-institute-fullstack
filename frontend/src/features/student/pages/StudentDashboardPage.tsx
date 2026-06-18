import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton'
import { EnrollmentCard } from '@/components/ui/EnrollmentCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatCard } from '@/components/ui/StatCard'
import { certificateService } from '@/services/certificateService'
import { enrollmentService } from '@/services/enrollmentService'
import { useAuthStore } from '@/store/authStore'
import { EnrollmentStatus, type EnrollmentResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user)
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
    (e) => e.status !== EnrollmentStatus.Cancelled,
  ).length

  const completedEnrollments = enrollments.filter(
    (e) => e.status === EnrollmentStatus.Completed,
  ).length

  const averageProgress =
    enrollments.length === 0
      ? 0
      : Math.round(
          enrollments.reduce((total, e) => total + e.progressPercentage, 0) /
            enrollments.length,
        )

  const inProgress = enrollments.filter(
    (e) =>
      e.status === EnrollmentStatus.InProgress ||
      e.status === EnrollmentStatus.Assigned,
  )

  const firstName = user?.fullName?.split(' ')[0]

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Student"
        title={firstName ? `Welcome back, ${firstName}` : 'Continue learning'}
        description="Pick up where you left off, track progress, and earn certificates."
        breadcrumbs={[{ label: 'Dashboard', to: '/student' }]}
      />

      {isLoading && <DashboardSkeleton statCount={4} cardCount={3} />}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <>
          {inProgress.length > 0 ? (
            <section className="dashboard-panel dashboard-panel--priority">
              <div className="dashboard-panel__head">
                <h2>Continue Learning</h2>
                <Link className="dashboard-panel__link" to="/student/enrollments">
                  View all →
                </Link>
              </div>
              <div className="course-grid">
                {inProgress.slice(0, 6).map((enrollment) => (
                  <EnrollmentCard
                    key={enrollment.courseEnrollmentId}
                    enrollment={enrollment}
                  />
                ))}
              </div>
            </section>
          ) : (
            <section className="dashboard-panel dashboard-panel--empty">
              <h2>No courses in progress</h2>
              <p className="page-text">
                Browse the catalog and enroll to start learning.
              </p>
              <Link className="home-btn home-btn--primary" to="/courses">
                Browse Courses
              </Link>
            </section>
          )}

          <section className="dashboard-panel">
            <div className="dashboard-panel__head">
              <h2>Your Progress</h2>
            </div>
            <div className="dashboard-progress-row">
              <ProgressRing percentage={averageProgress} label="Average" />
              <div className="dashboard-stats dashboard-stats--inline">
                <StatCard label="Active Courses" value={activeEnrollments} icon="📚" />
                <StatCard label="Completed" value={completedEnrollments} icon="✅" />
                <StatCard label="Certificates" value={certificateCount} icon="🏆" />
              </div>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel__head">
              <h2>Explore More</h2>
            </div>
            <div className="quick-link-grid">
              <Link to="/courses">Browse Courses</Link>
              <Link to="/student/enrollments">My Courses</Link>
              <Link to="/student/certificates">Certificates</Link>
              <Link to="/student/profile">Profile</Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
