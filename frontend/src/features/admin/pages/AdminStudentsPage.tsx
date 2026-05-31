import { useEffect, useState } from 'react'
import { studentService } from '@/services/studentService'
import type { PagedResponse, StudentProfileResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [city, setCity] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [students, setStudents] =
    useState<PagedResponse<StudentProfileResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadStudents() {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const result = await studentService.searchStudents({
        searchTerm: searchTerm.trim() || undefined,
        city: city.trim() || undefined,
        collegeName: collegeName.trim() || undefined,
        pageNumber,
        pageSize: 10,
      })
      setStudents(result)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber])

  function handleSearch() {
    setPageNumber(1)
    void loadStudents()
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Students</h1>
      <p className="page-text">Search and view student profile records.</p>

      <div className="filter-grid">
        <input
          type="search"
          placeholder="Search name/email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
        <input
          type="text"
          placeholder="College"
          value={collegeName}
          onChange={(event) => setCollegeName(event.target.value)}
        />
        <button className="secondary-button" type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {isLoading && <p className="page-text">Loading students...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && students?.items.length === 0 && (
        <div className="empty-state">No students found.</div>
      )}

      {!isLoading && !errorMessage && students && students.items.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>College</th>
                  <th>Passout</th>
                </tr>
              </thead>
              <tbody>
                {students.items.map((student) => (
                  <tr key={student.studentId}>
                    <td>{student.studentId}</td>
                    <td>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.city ?? '-'}</td>
                    <td>{student.collegeName ?? '-'}</td>
                    <td>{student.passoutYear ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <button
              className="secondary-button"
              type="button"
              disabled={!students.hasPreviousPage}
              onClick={() => setPageNumber((page) => page - 1)}
            >
              Previous
            </button>
            <span>
              Page {students.pageNumber} of {students.totalPages}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={!students.hasNextPage}
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
