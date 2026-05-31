import { useEffect, useState } from 'react'
import { enrollmentService } from '@/services/enrollmentService'
import {
  EnrollmentStatus,
  type EnrollmentResponse,
  type PagedResponse,
} from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

function getEnrollmentStatusLabel(status: number): string {
  if (status === EnrollmentStatus.Assigned) return 'Assigned'
  if (status === EnrollmentStatus.InProgress) return 'In Progress'
  if (status === EnrollmentStatus.Completed) return 'Completed'
  if (status === EnrollmentStatus.Cancelled) return 'Cancelled'
  return 'Unknown'
}

export function AdminEnrollmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [enrollments, setEnrollments] =
    useState<PagedResponse<EnrollmentResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadEnrollments() {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const result = await enrollmentService.searchEnrollments({
        searchTerm: searchTerm.trim() || undefined,
        status: status ? (Number(status) as EnrollmentStatus) : undefined,
        pageNumber,
        pageSize: 10,
      })
      setEnrollments(result)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadEnrollments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber])

  function handleSearch() {
    setPageNumber(1)
    void loadEnrollments()
  }

  async function handleStatusChange(
    courseEnrollmentId: number,
    nextStatus: number,
  ) {
    try {
      setUpdatingId(courseEnrollmentId)
      setErrorMessage('')
      setSuccessMessage('')
      await enrollmentService.updateStatus(courseEnrollmentId, {
        status: nextStatus as EnrollmentStatus,
      })
      setSuccessMessage('Enrollment status updated successfully.')
      await loadEnrollments()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Enrollments</h1>
      <p className="page-text">
        Search enrollments and update student course status.
      </p>

      <div className="filter-grid">
        <input
          type="search"
          placeholder="Search student or course..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value={EnrollmentStatus.Assigned}>Assigned</option>
          <option value={EnrollmentStatus.InProgress}>In Progress</option>
          <option value={EnrollmentStatus.Completed}>Completed</option>
          <option value={EnrollmentStatus.Cancelled}>Cancelled</option>
        </select>
        <button className="secondary-button" type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}
      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      {isLoading && <p className="page-text">Loading enrollments...</p>}

      {!isLoading && !errorMessage && enrollments?.items.length === 0 && (
        <div className="empty-state">No enrollments found.</div>
      )}

      {!isLoading && !errorMessage && enrollments && enrollments.items.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.items.map((enrollment) => (
                  <tr key={enrollment.courseEnrollmentId}>
                    <td>{enrollment.courseEnrollmentId}</td>
                    <td>{enrollment.studentName}</td>
                    <td>{enrollment.courseTitle}</td>
                    <td>{getEnrollmentStatusLabel(enrollment.status)}</td>
                    <td>{enrollment.progressPercentage}%</td>
                    <td>
                      <select
                        value={enrollment.status}
                        disabled={updatingId === enrollment.courseEnrollmentId}
                        onChange={(event) =>
                          handleStatusChange(
                            enrollment.courseEnrollmentId,
                            Number(event.target.value),
                          )
                        }
                      >
                        <option value={EnrollmentStatus.Assigned}>Assigned</option>
                        <option value={EnrollmentStatus.InProgress}>
                          In Progress
                        </option>
                        <option value={EnrollmentStatus.Completed}>Completed</option>
                        <option value={EnrollmentStatus.Cancelled}>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <button
              className="secondary-button"
              type="button"
              disabled={!enrollments.hasPreviousPage}
              onClick={() => setPageNumber((page) => page - 1)}
            >
              Previous
            </button>
            <span>
              Page {enrollments.pageNumber} of {enrollments.totalPages}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={!enrollments.hasNextPage}
              onClick={() => setPageNumber((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}
