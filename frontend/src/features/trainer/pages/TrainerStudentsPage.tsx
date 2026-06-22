/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useMemo, useState } from 'react'
import { enrollmentService } from '@/services/enrollmentService'
import { EnrollmentStatus, type EnrollmentResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

function statusLabel(status: EnrollmentStatus): string {
  if (status === EnrollmentStatus.Assigned) return 'Assigned'
  if (status === EnrollmentStatus.InProgress) return 'In Progress'
  if (status === EnrollmentStatus.Completed) return 'Completed'
  if (status === EnrollmentStatus.Cancelled) return 'Cancelled'
  return 'Unknown'
}

function statusClass(status: EnrollmentStatus): string {
  if (status === EnrollmentStatus.Completed) return 'badge badge-success'
  if (status === EnrollmentStatus.InProgress) return 'badge badge-info'
  if (status === EnrollmentStatus.Cancelled) return 'badge badge-danger'
  return 'badge badge-neutral'
}

export function TrainerStudentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const result = await enrollmentService.getTrainerEnrollments()
        setEnrollments(result)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }
    void loadData()
  }, [])

  // group by course title
  const grouped = useMemo(() => {
    const map = new Map<string, EnrollmentResponse[]>()
    for (const row of enrollments) {
      const list = map.get(row.courseTitle) ?? []
      list.push(row)
      map.set(row.courseTitle, list)
    }
    return Array.from(map.entries())
  }, [enrollments])

  return (
    <section className="page-card">
      <p className="eyebrow">Trainer</p>
      <h1>My Students</h1>
      <p className="page-text">
        Students enrolled in the courses assigned to you, with their current progress.
      </p>

      {isLoading && <p className="page-text">Loading enrollments...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && enrollments.length === 0 && (
        <div className="empty-state">
          No students have enrolled in your courses yet.
        </div>
      )}

      {!isLoading && !errorMessage && enrollments.length > 0 && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>Total Enrollments</span>
              <strong>{enrollments.length}</strong>
            </div>
            <div className="dashboard-card">
              <span>Active Courses</span>
              <strong>{grouped.length}</strong>
            </div>
            <div className="dashboard-card">
              <span>Completed</span>
              <strong>
                {
                  enrollments.filter((e) => e.status === EnrollmentStatus.Completed)
                    .length
                }
              </strong>
            </div>
            <div className="dashboard-card">
              <span>In Progress</span>
              <strong>
                {
                  enrollments.filter((e) => e.status === EnrollmentStatus.InProgress)
                    .length
                }
              </strong>
            </div>
          </div>

          {grouped.map(([courseTitle, rows]) => (
            <div key={courseTitle} style={{ marginTop: '2rem' }}>
              <h2 style={{ marginBottom: '0.75rem' }}>{courseTitle}</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Enrollment ID</th>
                      <th>Student</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Status</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.courseEnrollmentId}>
                        <td>{row.courseEnrollmentId}</td>
                        <td>{row.studentName}</td>
                        <td>{new Date(row.startDate).toLocaleDateString()}</td>
                        <td>{new Date(row.endDate).toLocaleDateString()}</td>
                        <td>
                          <span className={statusClass(row.status)}>
                            {statusLabel(row.status)}
                          </span>
                        </td>
                        <td>{row.progressPercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  )
}
