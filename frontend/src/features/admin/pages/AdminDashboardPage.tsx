import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Admin Dashboard</h1>
      <p className="page-text">
        Manage courses, students, enrollments, trainers, and certificates.
      </p>

      {isLoading && <p className="page-text">Loading dashboard...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>Total Students</span>
              <strong>{stats.students}</strong>
            </div>
            <div className="dashboard-card">
              <span>Total Courses</span>
              <strong>{stats.courses}</strong>
            </div>
            <div className="dashboard-card">
              <span>Total Enrollments</span>
              <strong>{stats.enrollments}</strong>
            </div>
            <div className="dashboard-card">
              <span>Total Certificates</span>
              <strong>{stats.certificates}</strong>
            </div>
          </div>

          <div className="quick-link-grid">
            <Link to="/admin/courses">Manage Courses</Link>
            <Link to="/admin/students">View Students</Link>
            <Link to="/admin/enrollments">Manage Enrollments</Link>
            <Link to="/admin/certificates">Issue Certificates</Link>
          </div>
        </>
      )}
    </section>
  )
}
