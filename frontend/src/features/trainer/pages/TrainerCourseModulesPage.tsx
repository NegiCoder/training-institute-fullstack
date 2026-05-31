import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { courseContentService } from '@/services/courseContentService'
import { courseTrainerService } from '@/services/courseTrainerService'
import { useAuthStore } from '@/store/authStore'
import {
  ContentType,
  type CourseContentResponse,
  type CourseTrainerResponse,
} from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const moduleSchema = z.object({
  courseId: z.number().min(1, 'Select a course'),
  moduleName: z.string().min(2, 'Module name is required'),
  contentType: z.number(),
  urlOrPath: z.string().min(2, 'URL or path is required'),
  sortOrder: z.number().int().min(1, 'Sort order must be 1 or more'),
  isActive: z.boolean(),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

function getContentTypeLabel(contentType: number): string {
  if (contentType === ContentType.Video) return 'Video'
  if (contentType === ContentType.Pdf) return 'PDF'
  if (contentType === ContentType.Link) return 'Link'
  return 'Content'
}

export function TrainerCourseModulesPage() {
  const user = useAuthStore((state) => state.user)
  const [assignedCourses, setAssignedCourses] = useState<CourseTrainerResponse[]>(
    [],
  )
  const [selectedCourseId, setSelectedCourseId] = useState(0)
  const [modules, setModules] = useState<CourseContentResponse[]>([])
  const [editingModule, setEditingModule] = useState<CourseContentResponse | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      courseId: 0,
      moduleName: '',
      contentType: ContentType.Video,
      urlOrPath: '',
      sortOrder: 1,
      isActive: true,
    },
  })

  useEffect(() => {
    async function loadAssignedCourses() {
      if (!user) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        setErrorMessage('')
        const result = await courseTrainerService.getCoursesByTrainerId(
          user.userId,
        )
        const unique = Array.from(
          new Map(result.map((row) => [row.courseId, row])).values(),
        )
        setAssignedCourses(unique)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadAssignedCourses()
  }, [user])

  async function loadModules(courseId: number) {
    if (!courseId) {
      setModules([])
      return
    }
    const result = await courseContentService.getByCourseId(courseId)
    setModules(result)
  }

  async function handleCourseChange(courseId: number) {
    setSelectedCourseId(courseId)
    setEditingModule(null)
    reset((values) => ({ ...values, courseId }))
    try {
      setErrorMessage('')
      await loadModules(courseId)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  function startEdit(module: CourseContentResponse) {
    setEditingModule(module)
    reset({
      courseId: module.courseId,
      moduleName: module.moduleName,
      contentType: module.contentType,
      urlOrPath: module.urlOrPath,
      sortOrder: module.sortOrder,
      isActive: module.isActive,
    })
  }

  function cancelEdit() {
    setEditingModule(null)
    reset({
      courseId: selectedCourseId,
      moduleName: '',
      contentType: ContentType.Video,
      urlOrPath: '',
      sortOrder: 1,
      isActive: true,
    })
  }

  async function onSubmit(values: ModuleFormValues) {
    setErrorMessage('')
    setSuccessMessage('')
    const request = {
      ...values,
      contentType: values.contentType as ContentType,
    }
    try {
      if (editingModule) {
        await courseContentService.update(editingModule.courseContentId, {
          moduleName: request.moduleName,
          contentType: request.contentType,
          urlOrPath: request.urlOrPath,
          sortOrder: request.sortOrder,
          isActive: request.isActive,
        })
        setSuccessMessage('Module updated successfully.')
      } else {
        await courseContentService.create(request)
        setSuccessMessage('Module created successfully.')
      }
      setSelectedCourseId(values.courseId)
      await loadModules(values.courseId)
      cancelEdit()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleDelete(courseContentId: number) {
    if (!window.confirm('Delete this module?')) return
    try {
      setErrorMessage('')
      setSuccessMessage('')
      await courseContentService.delete(courseContentId)
      setSuccessMessage('Module deleted successfully.')
      await loadModules(selectedCourseId)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Trainer</p>
      <h1>Course Modules</h1>
      <p className="page-text">
        Upload and manage the videos, PDFs, and links for the courses assigned to
        you.
      </p>

      {isLoading && <p className="page-text">Loading your courses...</p>}

      {!isLoading && assignedCourses.length === 0 && (
        <div className="empty-state">
          No courses are assigned to you yet. Ask an admin to assign you to a
          course first.
        </div>
      )}

      {!isLoading && assignedCourses.length > 0 && (
        <form className="course-admin-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="form-field">
            <span>Course</span>
            <select
              {...register('courseId', { valueAsNumber: true })}
              onChange={(event) => handleCourseChange(Number(event.target.value))}
            >
              <option value={0}>Select course</option>
              {assignedCourses.map((row) => (
                <option key={row.courseId} value={row.courseId}>
                  {row.courseTitle}
                </option>
              ))}
            </select>
            {errors.courseId && (
              <small className="field-error">{errors.courseId.message}</small>
            )}
          </label>

          <label className="form-field">
            <span>Module name</span>
            <input type="text" {...register('moduleName')} />
            {errors.moduleName && (
              <small className="field-error">{errors.moduleName.message}</small>
            )}
          </label>

          <label className="form-field">
            <span>Content type</span>
            <select {...register('contentType', { valueAsNumber: true })}>
              <option value={ContentType.Video}>Video</option>
              <option value={ContentType.Pdf}>PDF</option>
              <option value={ContentType.Link}>Link</option>
            </select>
          </label>

          <label className="form-field">
            <span>URL or path</span>
            <input type="text" {...register('urlOrPath')} />
            {errors.urlOrPath && (
              <small className="field-error">{errors.urlOrPath.message}</small>
            )}
          </label>

          <label className="form-field">
            <span>Sort order</span>
            <input
              type="number"
              {...register('sortOrder', { valueAsNumber: true })}
            />
            {errors.sortOrder && (
              <small className="field-error">{errors.sortOrder.message}</small>
            )}
          </label>

          <label className="checkbox-field">
            <input type="checkbox" {...register('isActive')} />
            <span>Active</span>
          </label>

          <div className="form-actions full-width">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {editingModule ? 'Update module' : 'Create module'}
            </button>
            {editingModule && (
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
      )}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}
      {successMessage && (
        <div className="alert success-alert">{successMessage}</div>
      )}

      {!isLoading && assignedCourses.length > 0 && selectedCourseId > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Module</th>
                <th>Type</th>
                <th>Sort</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <tr key={module.courseContentId}>
                  <td>{module.courseContentId}</td>
                  <td>{module.moduleName}</td>
                  <td>{getContentTypeLabel(module.contentType)}</td>
                  <td>{module.sortOrder}</td>
                  <td>{module.isActive ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => startEdit(module)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleDelete(module.courseContentId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {modules.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No modules yet for this course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
