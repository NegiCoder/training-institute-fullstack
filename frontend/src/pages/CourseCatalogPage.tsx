/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CourseCard } from '@/components/ui/CourseCard'
import { CourseGridSkeleton } from '@/components/ui/DashboardSkeleton'
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
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [categoryId, setCategoryId] = useState('')
  const [level, setLevel] = useState('')
  const [mode, setMode] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [categories, setCategories] = useState<CourseCategoryResponse[]>([])
  const [courses, setCourses] = useState<PagedResponse<CourseResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCategoryLoading, setIsCategoryLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    setSearchTerm(q)
    setPageNumber(1)
  }, [searchParams])

  // Filter dropdown ke liye categories ek baar load karte hai
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

  // Jab bhi koi filter ya page change ho, courses dobara fetch hote hai
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
          isFree:
            priceFilter === 'free' ? true : priceFilter === 'paid' ? false : undefined,
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
  }, [categoryId, level, mode, pageNumber, searchTerm, priceFilter])

  function handleSearchChange(value: string) {
    setSearchTerm(value)
    setPageNumber(1)
  }

  function resetFilters() {
    setSearchTerm('')
    setCategoryId('')
    setLevel('')
    setMode('')
    setPriceFilter('')
    setPageNumber(1)
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Courses</p>
      <h1>Course Catalog</h1>
      <p className="page-text">
        Explore our published courses and find the right one for you.
      </p>

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

        <select
          value={priceFilter}
          onChange={(event) => {
            setPriceFilter(event.target.value)
            setPageNumber(1)
          }}
        >
          <option value="">All prices</option>
          <option value="free">Free only</option>
          <option value="paid">Paid only</option>
        </select>

        <button className="secondary-button" type="button" onClick={resetFilters}>
          Clear filters
        </button>
      </div>

      {isLoading && <CourseGridSkeleton count={6} />}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && courses?.items.length === 0 && (
        <div className="empty-state">No courses found.</div>
      )}

      {!isLoading && !errorMessage && courses && courses.items.length > 0 && (
        <>
          <div className="course-grid">
            {courses.items.map((course) => (
              <CourseCard key={course.courseId} course={course} />
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
