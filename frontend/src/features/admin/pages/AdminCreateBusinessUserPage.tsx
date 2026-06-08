import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authService } from '@/services/authService'
import type { AuthResponse } from '@/types'
import { UserRole } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

// Form validation rules - password match etc.
const createBusinessUserSchema = z
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

type CreateBusinessUserFormValues = z.infer<typeof createBusinessUserSchema>

export function AdminCreateBusinessUserPage() {
  // Banaye gaye business user ka result dikhane ke liye
  const [createdUser, setCreatedUser] = useState<AuthResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBusinessUserFormValues>({
    resolver: zodResolver(createBusinessUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Submit hone par business user create API call hoti hai
  async function onSubmit(values: CreateBusinessUserFormValues) {
    setErrorMessage('')
    setCreatedUser(null)

    try {
      const response = await authService.createBusinessUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: UserRole.BusinessUser,
      })

      setCreatedUser(response)
      reset()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">Admin</p>
      <h1>Create Business User</h1>
      <p className="page-text">
        A business user can sign in and view only the reports dashboard. They cannot
        manage courses, students, or certificates.
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

        {createdUser && (
          <div className="alert success-alert">
            Business user created. User ID: {createdUser.userId}. Email:{' '}
            {createdUser.email}
          </div>
        )}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating business user...' : 'Create business user'}
        </button>
      </form>
    </section>
  )
}
