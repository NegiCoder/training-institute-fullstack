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
  // Success/error message UI ke liye, aur auth store me login ke baad data save hota hai
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

  // Form submit hone par backend ko login call jaata hai
  async function onSubmit(values: LoginFormValues) {
    setSuccessMessage('')
    setErrorMessage('')

    try {
      // Login API - token + user info wapas aata hai
      const response = await authService.login(values)
      // Token aur user ko global store me save kar dete hai
      setAuth(response)
      setSuccessMessage(`Welcome back, ${response.fullName}!`)
      // Role ke hisab se uske dashboard par bhej dete hai
      navigate(getDashboardPathByRole(response.role), { replace: true })
    } catch (error) {
      // Galat password / server error - friendly message dikha do
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">Sign In</p>
      <h1>Welcome back</h1>
      <p className="page-text">
        Sign in to continue learning and track your course progress.
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
