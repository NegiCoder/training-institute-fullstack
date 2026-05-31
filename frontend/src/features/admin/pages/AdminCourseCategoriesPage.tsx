import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { courseCategoryService } from '@/services/courseCategoryService'
import type { CourseCategoryResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  isActive: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function AdminCourseCategoriesPage() {
  const [categories, setCategories] = useState<CourseCategoryResponse[]>([])
  const [editingCategory, setEditingCategory] =
    useState<CourseCategoryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  })

  async function loadCategories() {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const result = await courseCategoryService.getAll()
      setCategories(result)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  function startEdit(category: CourseCategoryResponse) {
    setEditingCategory(category)
    reset({
      name: category.name,
      isActive: category.isActive,
    })
  }

  function cancelEdit() {
    setEditingCategory(null)
    reset({
      name: '',
      isActive: true,
    })
  }

  async function onSubmit(values: CategoryFormValues) {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (editingCategory) {
        await courseCategoryService.update(editingCategory.courseCategoryId, values)
        setSuccessMessage('Category updated successfully.')
      } else {
        await courseCategoryService.create({ name: values.name })
        setSuccessMessage('Category created successfully.')
      }

      cancelEdit()
      await loadCategories()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleDelete(categoryId: number) {
    const confirmed = window.confirm('Are you sure you want to delete this category?')

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await courseCategoryService.delete(categoryId)
      setSuccessMessage('Category deleted successfully.')
      await loadCategories()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Course Categories</h1>
      <p className="page-text">
        Create and manage course categories used by the course catalog.
      </p>

      <form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Category name</span>
          <input type="text" placeholder="Programming" {...register('name')} />
          {errors.name && (
            <small className="field-error">{errors.name.message}</small>
          )}
        </label>

        {editingCategory && (
          <label className="checkbox-field">
            <input type="checkbox" {...register('isActive')} />
            <span>Active</span>
          </label>
        )}

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {editingCategory ? 'Update category' : 'Create category'}
          </button>

          {editingCategory && (
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

      {isLoading && <p className="page-text">Loading categories...</p>}

      {!isLoading && categories.length === 0 && (
        <div className="empty-state">No categories found.</div>
      )}

      {!isLoading && categories.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.courseCategoryId}>
                  <td>{category.courseCategoryId}</td>
                  <td>{category.name}</td>
                  <td>{category.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => startEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleDelete(category.courseCategoryId)}
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
