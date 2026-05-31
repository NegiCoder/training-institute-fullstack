import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authService } from '@/services/authService'
import type { AuthResponse } from '@/types'
import { UserRole } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const createAdminSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type CreateAdminFormValues = z.infer<typeof createAdminSchema>

export function AdminCreateAdminPage() {
  const [createdAdmin, setCreatedAdmin] = useState<AuthResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: CreateAdminFormValues) {
    setErrorMessage('')
    setCreatedAdmin(null)

    try {
      const response = await authService.createAdmin({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: UserRole.Admin,
      })

      setCreatedAdmin(response)
      reset()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">Admin</p>
      <h1>Create Admin</h1>
      <p className="page-text">
        Create another admin account. Only existing admins can access this page.
      </p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Full name</span>
          <input type="text" {...register('fullName')} />
          {errors.fullName && (
            <small className="field-error">{errors.fullName.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Email</span>
          <input type="email" {...register('email')} />
          {errors.email && (
            <small className="field-error">{errors.email.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Password</span>
          <input type="password" {...register('password')} />
          {errors.password && (
            <small className="field-error">{errors.password.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Confirm password</span>
          <input type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <small className="field-error">{errors.confirmPassword.message}</small>
          )}
        </label>

        {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

        {createdAdmin && (
          <div className="alert success-alert">
            Admin created. User ID: {createdAdmin.userId}. Email: {createdAdmin.email}
          </div>
        )}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating admin...' : 'Create admin'}
        </button>
      </form>
    </section>
  )
}
