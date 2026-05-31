import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { courseCategoryService } from '@/services/courseCategoryService'
import { courseService } from '@/services/courseService'
import { CourseStatus, type CourseCategoryResponse, type CourseResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const courseSchema = z.object({
  courseCategoryId: z.number().min(1, 'Select a category'),
  title: z.string().min(2, 'Course title is required'),
  description: z.string().optional(),
  level: z.string().min(2, 'Level is required'),
  mode: z.string().min(2, 'Mode is required'),
  duration: z.string().min(2, 'Duration is required'),
  status: z.number(),
  isFeatured: z.boolean(),
})

type CourseFormValues = z.infer<typeof courseSchema>

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']
const MODE_OPTIONS = ['Online', 'Hybrid']

type CourseFilters = {
  searchTerm: string
  categoryId: string
  status: string
  level: string
  mode: string
  price: string
}

function getStatusLabel(status: number): string {
  if (status === CourseStatus.Draft) {
    return 'Draft'
  }

  if (status === CourseStatus.Published) {
    return 'Published'
  }

  if (status === CourseStatus.Archived) {
    return 'Archived'
  }

  return 'Unknown'
}

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [categories, setCategories] = useState<CourseCategoryResponse[]>([])
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [filterPrice, setFilterPrice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseCategoryId: 0,
      title: '',
      description: '',
      level: 'Beginner',
      mode: 'Online',
      duration: '',
      status: CourseStatus.Draft,
      isFeatured: false,
    },
  })

  async function loadData(filterOverride?: CourseFilters) {
    const activeFilters = filterOverride ?? {
      searchTerm,
      categoryId: filterCategoryId,
      status: filterStatus,
      level: filterLevel,
      mode: filterMode,
      price: filterPrice,
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      const [categoriesResult, coursesResult] = await Promise.all([
        courseCategoryService.getAll(),
        courseService.search({
          searchTerm: activeFilters.searchTerm.trim() || undefined,
          courseCategoryId: activeFilters.categoryId
            ? Number(activeFilters.categoryId)
            : undefined,
          status: activeFilters.status
            ? (Number(activeFilters.status) as CourseStatus)
            : undefined,
          level: activeFilters.level || undefined,
          mode: activeFilters.mode || undefined,
          isFree:
            activeFilters.price === '' ? undefined : activeFilters.price === 'free',
          pageNumber: 1,
          pageSize: 50,
        }),
      ])

      setCategories(categoriesResult.filter((category) => category.isActive))
      setCourses(coursesResult.items)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEdit(course: CourseResponse) {
    setEditingCourse(course)
    reset({
      courseCategoryId: course.courseCategoryId,
      title: course.title,
      description: course.description ?? '',
      level: course.level,
      mode: course.mode,
      duration: course.duration,
      status: course.status,
      isFeatured: course.isFeatured,
    })
  }

  function cancelEdit() {
    setEditingCourse(null)
    reset({
      courseCategoryId: 0,
      title: '',
      description: '',
      level: 'Beginner',
      mode: 'Online',
      duration: '',
      status: CourseStatus.Draft,
      isFeatured: false,
    })
  }

  async function onSubmit(values: CourseFormValues) {
    setErrorMessage('')
    setSuccessMessage('')

    const request = {
      ...values,
      description: values.description || null,
      status: values.status as CourseStatus,
    }

    try {
      if (editingCourse) {
        await courseService.update(editingCourse.courseId, request)
        setSuccessMessage('Course updated successfully.')
      } else {
        await courseService.create(request)
        setSuccessMessage('Course created successfully.')
      }

      cancelEdit()
      await loadData()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleDelete(courseId: number) {
    const confirmed = window.confirm('Are you sure you want to delete this course?')

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await courseService.delete(courseId)
      setSuccessMessage('Course deleted successfully.')
      await loadData()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  function resetFilters() {
    setSearchTerm('')
    setFilterCategoryId('')
    setFilterStatus('')
    setFilterLevel('')
    setFilterMode('')
    setFilterPrice('')
  }

  async function clearFilters() {
    const emptyFilters = {
      searchTerm: '',
      categoryId: '',
      status: '',
      level: '',
      mode: '',
      price: '',
    }

    resetFilters()
    await loadData(emptyFilters)
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Courses</h1>
      <p className="page-text">Create, publish, feature, search, and manage courses.</p>

      <div className="catalog-toolbar">
        <input
          type="search"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button
          className="secondary-button"
          type="button"
          onClick={() => void loadData()}
        >
          Search
        </button>
      </div>

      <div className="filter-grid">
        <select
          value={filterCategoryId}
          onChange={(event) => setFilterCategoryId(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.courseCategoryId} value={category.courseCategoryId}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
        >
          <option value="">Draft + published</option>
          <option value={CourseStatus.Draft}>Draft</option>
          <option value={CourseStatus.Published}>Published</option>
        </select>

        <select
          value={filterLevel}
          onChange={(event) => setFilterLevel(event.target.value)}
        >
          <option value="">All levels</option>
          {LEVEL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={filterMode}
          onChange={(event) => setFilterMode(event.target.value)}
        >
          <option value="">All modes</option>
          {MODE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={filterPrice}
          onChange={(event) => setFilterPrice(event.target.value)}
        >
          <option value="">All prices</option>
          <option value="free">Free only</option>
          <option value="paid">Paid only</option>
        </select>

        <button
          className="secondary-button"
          type="button"
          onClick={() => void loadData()}
        >
          Apply filters
        </button>

        <button
          className="secondary-button"
          type="button"
          onClick={() => void clearFilters()}
        >
          Clear filters
        </button>
      </div>

      <form className="course-admin-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Category</span>
          <select {...register('courseCategoryId', { valueAsNumber: true })}>
            <option value={0}>Select category</option>
            {categories.map((category) => (
              <option key={category.courseCategoryId} value={category.courseCategoryId}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.courseCategoryId && (
            <small className="field-error">{errors.courseCategoryId.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Title</span>
          <input type="text" {...register('title')} />
          {errors.title && (
            <small className="field-error">{errors.title.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Level</span>
          <input type="text" {...register('level')} />
          {errors.level && (
            <small className="field-error">{errors.level.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Mode</span>
          <input type="text" {...register('mode')} />
          {errors.mode && <small className="field-error">{errors.mode.message}</small>}
        </label>

        <label className="form-field">
          <span>Duration</span>
          <input type="text" placeholder="8 weeks" {...register('duration')} />
          {errors.duration && (
            <small className="field-error">{errors.duration.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Status</span>
          <select {...register('status', { valueAsNumber: true })}>
            <option value={CourseStatus.Draft}>Draft</option>
            <option value={CourseStatus.Published}>Published</option>
            <option value={CourseStatus.Archived}>Archived</option>
          </select>
        </label>

        <label className="form-field full-width">
          <span>Description</span>
          <textarea rows={4} {...register('description')} />
        </label>

        <label className="checkbox-field">
          <input type="checkbox" {...register('isFeatured')} />
          <span>Featured</span>
        </label>

        <div className="form-actions full-width">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {editingCourse ? 'Update course' : 'Create course'}
          </button>
          {editingCourse && (
            <button className="secondary-button" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      {isLoading && <p className="page-text">Loading courses...</p>}

      {!isLoading && courses.length === 0 && (
        <div className="empty-state">No courses found.</div>
      )}

      {!isLoading && courses.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseId}>
                  <td>{course.courseId}</td>
                  <td>{course.title}</td>
                  <td>{course.categoryName}</td>
                  <td>{getStatusLabel(course.status)}</td>
                  <td>
                    {course.isFree
                      ? 'Free'
                      : course.currentPrice != null
                        ? `₹${course.currentPrice}`
                        : 'Paid'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => startEdit(course)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleDelete(course.courseId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
