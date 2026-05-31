import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseService } from '@/services/courseService'
import { CourseStatus, type CourseResponse, type PagedResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function CourseCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [courses, setCourses] = useState<PagedResponse<CourseResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await courseService.search({
          searchTerm: searchTerm.trim() || undefined,
          status: CourseStatus.Published,
          pageNumber,
          pageSize: 6,
        })
        setCourses(result)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadCourses()
  }, [pageNumber, searchTerm])

  function handleSearchChange(value: string) {
    setSearchTerm(value)
    setPageNumber(1)
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Courses</p>
      <h1>Course Catalog</h1>
      <p className="page-text">Browse published courses from your backend API.</p>

      <div className="catalog-toolbar">
        <input
          type="search"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </div>

      {isLoading && <p className="page-text">Loading courses...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && courses?.items.length === 0 && (
        <div className="empty-state">No courses found.</div>
      )}

      {!isLoading && !errorMessage && courses && courses.items.length > 0 && (
        <>
          <div className="course-grid">
            {courses.items.map((course) => (
              <article className="course-card" key={course.courseId}>
                <div className="course-card-header">
                  <span>{course.categoryName}</span>
                  {course.isFeatured && <strong>Featured</strong>}
                </div>
                <h2>{course.title}</h2>
                <p>{course.description ?? 'No description available.'}</p>
                <div className="course-meta">
                  <span>{course.level}</span>
                  <span>{course.mode}</span>
                  <span>{course.duration}</span>
                </div>
                <Link className="course-link" to={`/courses/${course.courseId}`}>
                  View details
                </Link>
              </article>
            ))}
          </div>

          <div className="pagination-row">
            <button
              className="secondary-button"
              type="button"
              disabled={!courses.hasPreviousPage}
              onClick={() => setPageNumber((page) => page - 1)}
            >
              Previous
            </button>
            <span>
              Page {courses.pageNumber} of {courses.totalPages}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={!courses.hasNextPage}
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
