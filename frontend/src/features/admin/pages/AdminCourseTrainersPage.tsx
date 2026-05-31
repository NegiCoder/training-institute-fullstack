import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { courseService } from '@/services/courseService'
import { courseTrainerService } from '@/services/courseTrainerService'
import type { CourseResponse, CourseTrainerResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const assignTrainerSchema = z.object({
  courseId: z.number().min(1, 'Select a course'),
  trainerId: z.number().min(1, 'Enter a trainer user id'),
})

type AssignTrainerFormValues = z.infer<typeof assignTrainerSchema>

export function AdminCourseTrainersPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState(0)
  const [trainers, setTrainers] = useState<CourseTrainerResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignTrainerFormValues>({
    resolver: zodResolver(assignTrainerSchema),
    defaultValues: {
      courseId: 0,
      trainerId: 0,
    },
  })

  async function loadCourses() {
    const result = await courseService.search({ pageNumber: 1, pageSize: 50 })
    setCourses(result.items)
  }

  async function loadTrainers(courseId: number) {
    if (!courseId) {
      setTrainers([])
      return
    }

    const result = await courseTrainerService.getTrainersByCourseId(courseId)
    setTrainers(result)
  }

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        await loadCourses()
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  async function handleCourseChange(courseId: number) {
    setSelectedCourseId(courseId)
    reset((values) => ({ ...values, courseId }))

    try {
      setErrorMessage('')
      await loadTrainers(courseId)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function onSubmit(values: AssignTrainerFormValues) {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await courseTrainerService.assignTrainer(values)
      setSuccessMessage('Trainer assigned successfully.')
      setSelectedCourseId(values.courseId)
      await loadTrainers(values.courseId)
      reset({ courseId: values.courseId, trainerId: 0 })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleRemove(courseTrainerId: number) {
    if (!window.confirm('Remove this trainer assignment?')) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await courseTrainerService.removeTrainer(courseTrainerId)
      setSuccessMessage('Trainer removed successfully.')
      await loadTrainers(selectedCourseId)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Course Trainers</h1>
      <p className="page-text">
        Assign trainers to courses using the trainer user id.
      </p>

      {isLoading && <p className="page-text">Loading courses...</p>}

      <form className="course-admin-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Course</span>
          <select
            {...register('courseId', { valueAsNumber: true })}
            onChange={(event) => handleCourseChange(Number(event.target.value))}
          >
            <option value={0}>Select course</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <small className="field-error">{errors.courseId.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Trainer user id</span>
          <input type="number" {...register('trainerId', { valueAsNumber: true })} />
          {errors.trainerId && (
            <small className="field-error">{errors.trainerId.message}</small>
          )}
        </label>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            Assign trainer
          </button>
        </div>
      </form>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}
      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Trainer</th>
              <th>Email</th>
              <th>Assigned At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((trainer) => (
              <tr key={trainer.courseTrainerId}>
                <td>{trainer.courseTrainerId}</td>
                <td>{trainer.trainerFullName}</td>
                <td>{trainer.trainerEmail}</td>
                <td>{new Date(trainer.assignedAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => handleRemove(trainer.courseTrainerId)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
