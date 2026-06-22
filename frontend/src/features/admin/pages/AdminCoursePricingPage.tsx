/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { coursePricingService } from '@/services/coursePricingService'
import { courseService } from '@/services/courseService'
import type { CoursePricingResponse, CourseResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const pricingSchema = z.object({
  courseId: z.number().min(1, 'Select a course'),
  year: z
    .number()
    .int()
    .min(2000, 'Enter a valid year')
    .max(2100, 'Enter a valid year'),
  price: z.number().min(0, 'Price cannot be negative'),
  isFree: z.boolean(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
})

type PricingFormValues = z.infer<typeof pricingSchema>

export function AdminCoursePricingPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState(0)
  const [pricingRows, setPricingRows] = useState<CoursePricingResponse[]>([])
  const [editingPricing, setEditingPricing] = useState<CoursePricingResponse | null>(
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
  } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      courseId: 0,
      year: new Date().getFullYear(),
      price: 0,
      isFree: false,
      effectiveFrom: '',
      effectiveTo: '',
    },
  })

  async function loadCourses() {
    const result = await courseService.search({ pageNumber: 1, pageSize: 50 })
    setCourses(result.items)
  }

  async function loadPricing(courseId: number) {
    if (!courseId) {
      setPricingRows([])
      return
    }

    const result = await coursePricingService.getByCourseId(courseId)
    setPricingRows(result)
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
    reset((values) => ({
      ...values,
      courseId,
    }))
    setEditingPricing(null)

    try {
      setErrorMessage('')
      await loadPricing(courseId)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  function startEdit(row: CoursePricingResponse) {
    setEditingPricing(row)
    reset({
      courseId: row.courseId,
      year: row.year,
      price: row.price,
      isFree: row.isFree,
      effectiveFrom: row.effectiveFrom?.slice(0, 10) ?? '',
      effectiveTo: row.effectiveTo?.slice(0, 10) ?? '',
    })
  }

  function cancelEdit() {
    setEditingPricing(null)
    reset({
      courseId: selectedCourseId,
      year: new Date().getFullYear(),
      price: 0,
      isFree: false,
      effectiveFrom: '',
      effectiveTo: '',
    })
  }

  async function onSubmit(values: PricingFormValues) {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (editingPricing) {
        await coursePricingService.update(editingPricing.coursePricingId, {
          year: values.year,
          price: values.price,
          isFree: values.isFree,
          effectiveFrom: values.effectiveFrom || null,
          effectiveTo: values.effectiveTo || null,
        })
        setSuccessMessage('Pricing updated successfully.')
      } else {
        await coursePricingService.create({
          courseId: values.courseId,
          year: values.year,
          price: values.price,
          isFree: values.isFree,
          effectiveFrom: values.effectiveFrom || null,
          effectiveTo: values.effectiveTo || null,
        })
        setSuccessMessage('Pricing created successfully.')
      }

      setSelectedCourseId(values.courseId)
      await loadPricing(values.courseId)
      cancelEdit()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleDelete(coursePricingId: number) {
    if (!window.confirm('Delete this pricing row?')) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await coursePricingService.delete(coursePricingId)
      setSuccessMessage('Pricing deleted successfully.')
      await loadPricing(selectedCourseId)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Course Pricing</h1>
      <p className="page-text">Manage yearly pricing for each course.</p>

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
          <span>Year</span>
          <input type="number" {...register('year', { valueAsNumber: true })} />
          {errors.year && <small className="field-error">{errors.year.message}</small>}
        </label>

        <label className="form-field">
          <span>Price</span>
          <input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && (
            <small className="field-error">{errors.price.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Effective from</span>
          <input type="date" {...register('effectiveFrom')} />
        </label>

        <label className="form-field">
          <span>Effective to</span>
          <input type="date" {...register('effectiveTo')} />
        </label>

        <label className="checkbox-field">
          <input type="checkbox" {...register('isFree')} />
          <span>Free course</span>
        </label>

        <div className="form-actions full-width">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {editingPricing ? 'Update pricing' : 'Create pricing'}
          </button>
          {editingPricing && (
            <button className="secondary-button" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}
      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course</th>
              <th>Year</th>
              <th>Price</th>
              <th>Free</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pricingRows.map((row) => (
              <tr key={row.coursePricingId}>
                <td>{row.coursePricingId}</td>
                <td>{row.courseTitle}</td>
                <td>{row.year}</td>
                <td>{row.isFree ? 'Free' : `₹${row.price}`}</td>
                <td>{row.isFree ? 'Yes' : 'No'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(row.coursePricingId)}
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
    </section>
  )
}
