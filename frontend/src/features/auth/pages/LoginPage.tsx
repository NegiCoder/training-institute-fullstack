import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { getDashboardPathByRole } from '@/utils/getDashboardPathByRole'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await authService.login(values)
      setAuth(response)
      setSuccessMessage(
        `Logged in as ${response.fullName} (${response.role}). Token saved.`,
      )
      navigate(getDashboardPathByRole(response.role), { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">Authentication</p>
      <h1>Login</h1>
      <p className="page-text">
        Enter your email and password. This form calls your backend endpoint:
        <strong> POST /api/auth/login</strong>.
      </p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Email</span>
          <input type="email" placeholder="admin@training.com" {...register('email')} />
          {errors.email && (
            <small className="field-error">{errors.email.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Password</span>
          <input type="password" placeholder="Admin@123" {...register('password')} />
          {errors.password && (
            <small className="field-error">{errors.password.message}</small>
          )}
        </label>

        {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

        {successMessage && <div className="alert success-alert">{successMessage}</div>}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </section>
  )
}
