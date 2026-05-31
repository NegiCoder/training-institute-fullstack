import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { courseContentService } from '@/services/courseContentService'
import { coursePricingService } from '@/services/coursePricingService'
import { courseService } from '@/services/courseService'
import { courseTrainerService } from '@/services/courseTrainerService'
import { enrollmentService } from '@/services/enrollmentService'
import { useAuthStore } from '@/store/authStore'
import type {
  CourseContentResponse,
  CoursePricingResponse,
  CourseResponse,
  CourseTrainerResponse,
} from '@/types'
import { ContentType } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

function getContentTypeLabel(contentType: number): string {
  if (contentType === ContentType.Video) {
    return 'Video'
  }

  if (contentType === ContentType.Pdf) {
    return 'PDF'
  }

  if (contentType === ContentType.Link) {
    return 'Link'
  }

  return 'Content'
}

export function CourseDetailPage() {
  const { courseId } = useParams()
  const parsedCourseId = Number(courseId)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [pricing, setPricing] = useState<CoursePricingResponse[]>([])
  const [modules, setModules] = useState<CourseContentResponse[]>([])
  const [trainers, setTrainers] = useState<CourseTrainerResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadCourseDetails() {
      if (!parsedCourseId) {
        setErrorMessage('Invalid course id.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')

        const [courseResult, pricingResult, modulesResult, trainersResult] =
          await Promise.all([
            courseService.getById(parsedCourseId),
            coursePricingService.getByCourseId(parsedCourseId),
            courseContentService.getByCourseId(parsedCourseId),
            courseTrainerService.getTrainersByCourseId(parsedCourseId),
          ])

        setCourse(courseResult)
        setPricing(pricingResult)
        setModules(modulesResult)
        setTrainers(trainersResult)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadCourseDetails()
  }, [parsedCourseId])

  async function handleEnroll() {
    if (!course) {
      return
    }

    setIsEnrolling(true)
    setSuccessMessage('')
    setErrorMessage('')

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 2)

    try {
      await enrollmentService.createMyEnrollment({
        courseId: course.courseId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      setSuccessMessage('You are enrolled in this course.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isLoading) {
    return (
      <section className="page-card narrow-card">
        <p className="page-text">Loading course details...</p>
      </section>
    )
  }

  if (errorMessage || !course) {
    return (
      <section className="page-card narrow-card">
        <p className="eyebrow">Course</p>
        <h1>Unable to load course</h1>
        <div className="alert error-alert">{errorMessage || 'Course not found.'}</div>
        <Link className="primary-link" to="/courses">
          Back to courses
        </Link>
      </section>
    )
  }

  return (
    <section className="page-card">
      <Link className="back-link" to="/courses">
        Back to courses
      </Link>

      <p className="eyebrow">{course.categoryName}</p>
      <h1>{course.title}</h1>
      <p className="page-text">{course.description ?? 'No description available.'}</p>

      <div className="course-meta detail-meta">
        <span>{course.level}</span>
        <span>{course.mode}</span>
        <span>{course.duration}</span>
        {course.isOpenAccess && <span>Open access</span>}
        {course.isFeatured && <span>Featured</span>}
      </div>

      <div className="detail-actions">
        {isAuthenticated && user?.role === 'Student' ? (
          <button
            className="primary-button"
            type="button"
            disabled={isEnrolling}
            onClick={handleEnroll}
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll in this course'}
          </button>
        ) : (
          <p className="page-text">Login as a student to enroll in this course.</p>
        )}
      </div>

      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      <div className="detail-grid">
        <section className="detail-panel">
          <h2>Pricing</h2>
          {pricing.length === 0 ? (
            <p>No pricing added yet.</p>
          ) : (
            <ul className="plain-list">
              {pricing.map((price) => (
                <li key={price.coursePricingId}>
                  <strong>{price.year}</strong>
                  <span>{price.isFree ? 'Free' : `₹${price.price}`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="detail-panel">
          <h2>Trainers</h2>
          {trainers.length === 0 ? (
            <p>No trainers assigned yet.</p>
          ) : (
            <ul className="plain-list">
              {trainers.map((trainer) => (
                <li key={trainer.courseTrainerId}>
                  <strong>{trainer.trainerFullName}</strong>
                  <span>{trainer.trainerEmail}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="detail-panel modules-panel">
        <h2>Course Modules</h2>
        {modules.length === 0 ? (
          <p>No modules added yet.</p>
        ) : (
          <ol className="module-list-detail">
            {modules.map((module) => (
              <li key={module.courseContentId}>
                <div>
                  <strong>{module.moduleName}</strong>
                  <span>{getContentTypeLabel(module.contentType)}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  )
}
