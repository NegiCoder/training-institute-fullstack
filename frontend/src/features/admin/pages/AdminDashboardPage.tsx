/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton'
import { certificateService } from '@/services/certificateService'
import { courseService } from '@/services/courseService'
import { enrollmentService } from '@/services/enrollmentService'
import { studentService } from '@/services/studentService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

type AdminStats = {
  students: number
  courses: number
  enrollments: number
  certificates: number
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    students: 0,
    courses: 0,
    enrollments: 0,
    certificates: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [students, courses, enrollments, certificates] = await Promise.all([
          studentService.getAllStudents(),
          courseService.getAll(),
          enrollmentService.getAllEnrollments(),
          certificateService.getAll(),
        ])

        setStats({
          students: students.length,
          courses: courses.length,
          enrollments: enrollments.length,
          certificates: certificates.length,
        })
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Admin"
        title="Institute Overview"
        description="KPIs at a glance — use the sections below to manage courses, people, and analytics."
        breadcrumbs={[{ label: 'Overview', to: '/admin' }]}
        actions={
          <Link className="home-btn home-btn--primary" to="/admin/reports">
            View Reports
          </Link>
        }
      />

      {isLoading && <DashboardSkeleton statCount={4} cardCount={0} />}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <>
          <section className="dashboard-stats" aria-label="Institute KPIs">
            <StatCard label="Students" value={stats.students} icon="🎓" />
            <StatCard label="Courses" value={stats.courses} icon="📚" />
            <StatCard label="Enrollments" value={stats.enrollments} icon="📋" />
            <StatCard label="Certificates" value={stats.certificates} icon="🏆" />
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel__head">
              <h2>Learning</h2>
            </div>
            <div className="quick-link-grid">
              <Link to="/admin/courses">Courses</Link>
              <Link to="/admin/course-categories">Categories</Link>
              <Link to="/admin/course-pricing">Pricing</Link>
              <Link to="/admin/course-trainers">Trainers</Link>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel__head">
              <h2>People</h2>
            </div>
            <div className="quick-link-grid">
              <Link to="/admin/students">Students</Link>
              <Link to="/admin/enrollments">Enrollments</Link>
              <Link to="/admin/certificates">Certificates</Link>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel__head">
              <h2>Analytics</h2>
            </div>
            <div className="quick-link-grid">
              <Link to="/admin/reports">Reports Dashboard</Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
