import { useEffect, useState } from 'react'
import { EnrollmentCard } from '@/components/ui/EnrollmentCard'
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton'
import { PageHeader } from '@/components/ui/PageHeader'
import { enrollmentService } from '@/services/enrollmentService'
import type { EnrollmentResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

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
    <div className="dashboard-page">
      <PageHeader
        eyebrow="My Learning"
        title="My Courses"
        description="Track your enrolled courses, current status, and progress percentage."
        breadcrumbs={[{ label: 'Dashboard', to: '/student' }, { label: 'My Courses' }]}
      />

      {isLoading && <DashboardSkeleton statCount={0} cardCount={4} />}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && enrollments.length === 0 && (
        <div className="empty-state">You are not enrolled in any courses yet.</div>
      )}

      {!isLoading && !errorMessage && enrollments.length > 0 && (
        <div className="course-grid">
          {enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.courseEnrollmentId}
              enrollment={enrollment}
            />
          ))}
        </div>
      )}
    </div>
  )
}
