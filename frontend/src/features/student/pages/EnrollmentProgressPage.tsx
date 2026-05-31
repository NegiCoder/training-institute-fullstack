import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { courseContentService } from '@/services/courseContentService'
import { enrollmentService } from '@/services/enrollmentService'
import { progressService } from '@/services/progressService'
import type {
  CourseContentResponse,
  EnrollmentResponse,
  StudentModuleProgressResponse,
} from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function EnrollmentProgressPage() {
  const { courseEnrollmentId } = useParams()
  const parsedEnrollmentId = Number(courseEnrollmentId)

  const [enrollment, setEnrollment] = useState<EnrollmentResponse | null>(null)
  const [modules, setModules] = useState<CourseContentResponse[]>([])
  const [progressRows, setProgressRows] = useState<StudentModuleProgressResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingModuleId, setSavingModuleId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const completedModuleIds = useMemo(
    () => new Set(progressRows.map((row) => row.courseContentId)),
    [progressRows],
  )

  const progressPercentage =
    progressRows[0]?.progressPercentage ?? enrollment?.progressPercentage ?? 0

  async function loadProgress() {
    if (!parsedEnrollmentId) {
      setErrorMessage('Invalid enrollment id.')
      setIsLoading(false)
      return
    }

    try {
      setErrorMessage('')
      const myEnrollments = await enrollmentService.getMyEnrollments()
      const currentEnrollment = myEnrollments.find(
        (item) => item.courseEnrollmentId === parsedEnrollmentId,
      )

      if (!currentEnrollment) {
        setErrorMessage('Enrollment not found.')
        return
      }

      const [modulesResult, progressResult] = await Promise.all([
        courseContentService.getByCourseId(currentEnrollment.courseId),
        progressService.getProgressByEnrollmentId(parsedEnrollmentId),
      ])

      setEnrollment(currentEnrollment)
      setModules(modulesResult)
      setProgressRows(progressResult)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedEnrollmentId])

  async function handleMarkComplete(courseContentId: number) {
    setSavingModuleId(courseContentId)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await progressService.markModuleComplete({
        courseEnrollmentId: parsedEnrollmentId,
        courseContentId,
      })
      setSuccessMessage('Module marked complete.')
      await loadProgress()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setSavingModuleId(null)
    }
  }

  if (isLoading) {
    return (
      <section className="page-card narrow-card">
        <p className="page-text">Loading progress...</p>
      </section>
    )
  }

  return (
    <section className="page-card">
      <Link className="back-link" to="/student/enrollments">
        Back to my courses
      </Link>

      <p className="eyebrow">Progress</p>
      <h1>{enrollment?.courseTitle ?? 'Course Progress'}</h1>
      <p className="page-text">Complete modules to update your course progress.</p>

      <div className="progress-summary">
        <strong>{progressPercentage}% complete</strong>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      {modules.length === 0 && !errorMessage && (
        <div className="empty-state">No modules found for this course.</div>
      )}

      {modules.length > 0 && (
        <div className="module-progress-list">
          {modules.map((module) => {
            const isCompleted = completedModuleIds.has(module.courseContentId)

            return (
              <article className="module-progress-card" key={module.courseContentId}>
                <div>
                  <strong>{module.moduleName}</strong>
                  <span>{isCompleted ? 'Completed' : 'Pending'}</span>
                </div>
                <button
                  className={isCompleted ? 'secondary-button' : 'primary-button'}
                  type="button"
                  disabled={isCompleted || savingModuleId === module.courseContentId}
                  onClick={() => handleMarkComplete(module.courseContentId)}
                >
                  {isCompleted
                    ? 'Completed'
                    : savingModuleId === module.courseContentId
                      ? 'Saving...'
                      : 'Mark complete'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
