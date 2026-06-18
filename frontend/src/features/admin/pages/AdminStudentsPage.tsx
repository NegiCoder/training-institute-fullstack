import { useEffect, useState } from 'react'
import { DataTable, PaginationRow } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
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
    <div className="dashboard-page">
      <PageHeader
        eyebrow="People"
        title="Students"
        description="Search and view student profile records."
        breadcrumbs={[{ label: 'Overview', to: '/admin' }, { label: 'Students' }]}
      />

      <section className="page-card">
        <div className="filter-grid">
          <input
            type="search"
            placeholder="Search name/email…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search students"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            aria-label="Filter by city"
          />
          <input
            type="text"
            placeholder="College"
            value={collegeName}
            onChange={(event) => setCollegeName(event.target.value)}
            aria-label="Filter by college"
          />
          <button className="secondary-button" type="button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

        <DataTable
          caption="Students table"
          isLoading={isLoading}
          rows={students?.items ?? []}
          rowKey={(s) => s.studentId}
          emptyMessage="No students found."
          columns={[
            {
              key: 'id',
              header: 'ID',
              hideOnMobile: true,
              render: (s) => s.studentId,
            },
            {
              key: 'name',
              header: 'Name',
              render: (s) => s.fullName,
            },
            {
              key: 'email',
              header: 'Email',
              render: (s) => s.email,
            },
            {
              key: 'city',
              header: 'City',
              render: (s) => s.city ?? '—',
            },
            {
              key: 'college',
              header: 'College',
              render: (s) => s.collegeName ?? '—',
            },
            {
              key: 'passout',
              header: 'Passout',
              render: (s) => s.passoutYear ?? '—',
            },
          ]}
        />

        {students && students.items.length > 0 && (
          <PaginationRow
            pageNumber={students.pageNumber}
            totalPages={students.totalPages}
            hasPreviousPage={students.hasPreviousPage}
            hasNextPage={students.hasNextPage}
            onPrevious={() => setPageNumber((p) => p - 1)}
            onNext={() => setPageNumber((p) => p + 1)}
          />
        )}
      </section>
    </div>
  )
}
