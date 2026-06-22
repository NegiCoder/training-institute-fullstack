/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { courseTrainerService } from '@/services/courseTrainerService'
import { enrollmentService } from '@/services/enrollmentService'
import { useAuthStore } from '@/store/authStore'
import type { CourseTrainerResponse, EnrollmentResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function TrainerDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [assignedCourses, setAssignedCourses] = useState<CourseTrainerResponse[]>([])
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
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Trainer"
        title={
          user?.fullName
            ? `Welcome, ${user.fullName.split(' ')[0]}`
            : 'Trainer Overview'
        }
        description="Upload and manage course content, and track students enrolled in your courses."
        breadcrumbs={[{ label: 'Overview', to: '/trainer' }]}
      />

      {isLoading && <DashboardSkeleton statCount={4} cardCount={0} />}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <>
          <section className="dashboard-stats" aria-label="Trainer stats">
            <StatCard label="Assigned Courses" value={uniqueCourseCount} icon="📚" />
            <StatCard label="Enrolled Students" value={enrollments.length} icon="🎓" />
            <StatCard label="Trainer" value={user?.fullName ?? '-'} icon="🧑‍🏫" />
            <StatCard label="Role" value={user?.role ?? '-'} icon="📊" />
          </section>

          {assignedCourses.length > 0 && (
            <section className="dashboard-panel">
              <div className="dashboard-panel__head">
                <h2>Assigned Courses</h2>
                <Link className="dashboard-panel__link" to="/trainer/courses">
                  View all →
                </Link>
              </div>
              <div className="course-grid">
                {assignedCourses.slice(0, 6).map((course) => (
                  <article className="lms-course-card" key={course.courseTrainerId}>
                    <div className="lms-course-card__header">
                      <span className="lms-course-card__category">Assigned</span>
                    </div>
                    <h3 className="lms-course-card__title">{course.courseTitle}</h3>
                    <p className="lms-course-card__desc">
                      Assigned {new Date(course.assignedAt).toLocaleDateString()}
                    </p>
                    <Link className="lms-course-card__btn" to="/trainer/modules">
                      Manage Content
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="dashboard-panel">
            <div className="dashboard-panel__head">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-link-grid">
              <Link to="/trainer/courses">My Courses</Link>
              <Link to="/trainer/modules">Manage Content</Link>
              <Link to="/trainer/students">My Students</Link>
              <Link to="/courses">Course Catalog</Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
