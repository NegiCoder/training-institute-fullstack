/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { getDashboardPathByRole } from '@/utils/getDashboardPathByRole'

const registerSchema = z
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

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Form submit hone par naya student account banta hai
  async function onSubmit(values: RegisterFormValues) {
    setErrorMessage('')

    try {
      // Register API - public signup hamesha Student role me banta hai
      const response = await authService.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: UserRole.Student,
      })

      // Register ke turant baad auto-login - token store me save kar dete hai
      setAuth(response)
      navigate(getDashboardPathByRole(response.role), { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">Get Started</p>
      <h1>Create your account</h1>
      <p className="page-text">
        Join ExcelGens for free and start learning job-ready skills today.
      </p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Full name</span>
          <input type="text" placeholder="Jane Student" {...register('fullName')} />
          {errors.fullName && (
            <small className="field-error">{errors.fullName.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="student@training.com"
            {...register('email')}
          />
          {errors.email && (
            <small className="field-error">{errors.email.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Password</span>
          <input type="password" placeholder="Student@123" {...register('password')} />
          {errors.password && (
            <small className="field-error">{errors.password.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Confirm password</span>
          <input
            type="password"
            placeholder="Student@123"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <small className="field-error">{errors.confirmPassword.message}</small>
          )}
        </label>

        {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create student account'}
        </button>
      </form>
    </section>
  )
}
