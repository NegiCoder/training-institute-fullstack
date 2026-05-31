import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { courseCategoryService } from '@/services/courseCategoryService'
import { courseService } from '@/services/courseService'
import {
  CourseStatus,
  type CourseCategoryResponse,
  type CourseResponse,
} from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const courseSchema = z.object({
  courseCategoryId: z.number().min(1, 'Select a category'),
  title: z.string().min(2, 'Course title is required'),
  description: z.string().optional(),
  level: z.string().min(2, 'Level is required'),
  mode: z.string().min(2, 'Mode is required'),
  duration: z.string().min(2, 'Duration is required'),
  status: z.number(),
  isOpenAccess: z.boolean(),
  isFeatured: z.boolean(),
})

type CourseFormValues = z.infer<typeof courseSchema>

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
      isOpenAccess: false,
      isFeatured: false,
    },
  })

  async function loadData() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const [categoriesResult, coursesResult] = await Promise.all([
        courseCategoryService.getAll(),
        searchTerm.trim()
          ? courseService.search({
              searchTerm: searchTerm.trim(),
              pageNumber: 1,
              pageSize: 50,
            })
          : courseService.search({
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
      isOpenAccess: course.isOpenAccess,
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
      isOpenAccess: false,
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

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Courses</h1>
      <p className="page-text">
        Create, publish, feature, search, and manage courses.
      </p>

      <div className="catalog-toolbar">
        <input
          type="search"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button className="secondary-button" type="button" onClick={loadData}>
          Search
        </button>
      </div>

      <form className="course-admin-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Category</span>
          <select {...register('courseCategoryId', { valueAsNumber: true })}>
            <option value={0}>Select category</option>
            {categories.map((category) => (
              <option
                key={category.courseCategoryId}
                value={category.courseCategoryId}
              >
                {category.name}
              </option>
            ))}
          </select>
          {errors.courseCategoryId && (
            <small className="field-error">
              {errors.courseCategoryId.message}
            </small>
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
          {errors.mode && (
            <small className="field-error">{errors.mode.message}</small>
          )}
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
          <input type="checkbox" {...register('isOpenAccess')} />
          <span>Open access</span>
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
            <button
              className="secondary-button"
              type="button"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {successMessage && (
        <div className="alert success-alert">{successMessage}</div>
      )}

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
                <th>Featured</th>
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
                  <td>{course.isFeatured ? 'Yes' : 'No'}</td>
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
