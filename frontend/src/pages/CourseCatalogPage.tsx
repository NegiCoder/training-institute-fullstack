import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseCategoryService } from '@/services/courseCategoryService'
import { courseService } from '@/services/courseService'
import {
  CourseStatus,
  type CourseCategoryResponse,
  type CourseResponse,
  type PagedResponse,
} from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']
const MODE_OPTIONS = ['Online', 'Hybrid']

export function CourseCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [level, setLevel] = useState('')
  const [mode, setMode] = useState('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [showOpenAccessOnly, setShowOpenAccessOnly] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [categories, setCategories] = useState<CourseCategoryResponse[]>([])
  const [courses, setCourses] = useState<PagedResponse<CourseResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCategoryLoading, setIsCategoryLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await courseCategoryService.getAll()
        setCategories(result.filter((category) => category.isActive))
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsCategoryLoading(false)
      }
    }

    void loadCategories()
  }, [])

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await courseService.search({
          searchTerm: searchTerm.trim() || undefined,
          courseCategoryId: categoryId ? Number(categoryId) : undefined,
          level: level || undefined,
          mode: mode || undefined,
          status: CourseStatus.Published,
          isFeatured: showFeaturedOnly ? true : undefined,
          isOpenAccess: showOpenAccessOnly ? true : undefined,
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
  }, [
    categoryId,
    level,
    mode,
    pageNumber,
    searchTerm,
    showFeaturedOnly,
    showOpenAccessOnly,
  ])

  function handleSearchChange(value: string) {
    setSearchTerm(value)
    setPageNumber(1)
  }

  function resetFilters() {
    setSearchTerm('')
    setCategoryId('')
    setLevel('')
    setMode('')
    setShowFeaturedOnly(false)
    setShowOpenAccessOnly(false)
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

      <div className="filter-grid">
        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value)
            setPageNumber(1)
          }}
          disabled={isCategoryLoading}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.courseCategoryId} value={category.courseCategoryId}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={level}
          onChange={(event) => {
            setLevel(event.target.value)
            setPageNumber(1)
          }}
        >
          <option value="">All levels</option>
          {LEVEL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={mode}
          onChange={(event) => {
            setMode(event.target.value)
            setPageNumber(1)
          }}
        >
          <option value="">All modes</option>
          {MODE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={showFeaturedOnly}
            onChange={(event) => {
              setShowFeaturedOnly(event.target.checked)
              setPageNumber(1)
            }}
          />
          <span>Featured only</span>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={showOpenAccessOnly}
            onChange={(event) => {
              setShowOpenAccessOnly(event.target.checked)
              setPageNumber(1)
            }}
          />
          <span>Open access only</span>
        </label>

        <button className="secondary-button" type="button" onClick={resetFilters}>
          Clear filters
        </button>
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
