import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { studentService } from '@/services/studentService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const studentProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  city: z.string().optional(),
  dateOfBirth: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  guardianName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  collegeName: z.string().optional(),
  passoutYear: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) {
        return true
      }

      const year = Number(value)
      return Number.isInteger(year) && year >= 1900 && year <= 2100
    }, 'Enter a valid year'),
})

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>

export function StudentProfilePage() {
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      dateOfBirth: '',
      addressLine1: '',
      addressLine2: '',
      guardianName: '',
      emergencyPhone: '',
      collegeName: '',
      passoutYear: '',
    },
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await studentService.getMyProfile()
        setHasProfile(true)
        reset({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone ?? '',
          city: profile.city ?? '',
          dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? '',
          addressLine1: profile.addressLine1 ?? '',
          addressLine2: profile.addressLine2 ?? '',
          guardianName: profile.guardianName ?? '',
          emergencyPhone: profile.emergencyPhone ?? '',
          collegeName: profile.collegeName ?? '',
          passoutYear: profile.passoutYear?.toString() ?? '',
        })
      } catch {
        setHasProfile(false)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [reset])

  async function onSubmit(values: StudentProfileFormValues) {
    setSuccessMessage('')
    setErrorMessage('')

    const request = {
      ...values,
      passoutYear: values.passoutYear === '' ? null : Number(values.passoutYear),
    }

    try {
      if (hasProfile) {
        await studentService.updateMyProfile(request)
        setSuccessMessage('Profile updated successfully.')
      } else {
        await studentService.createMyProfile(request)
        setHasProfile(true)
        setSuccessMessage('Profile created successfully.')
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <section className="page-card narrow-card">
        <p className="page-text">Loading profile...</p>
      </section>
    )
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Student</p>
      <h1>My Profile</h1>
      <p className="page-text">
        Complete your student profile so enrollments and certificates can use accurate
        information.
      </p>

      <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>First name</span>
          <input type="text" {...register('firstName')} />
          {errors.firstName && (
            <small className="field-error">{errors.firstName.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Last name</span>
          <input type="text" {...register('lastName')} />
          {errors.lastName && (
            <small className="field-error">{errors.lastName.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Phone</span>
          <input type="tel" {...register('phone')} />
        </label>

        <label className="form-field">
          <span>City</span>
          <input type="text" {...register('city')} />
        </label>

        <label className="form-field">
          <span>Date of birth</span>
          <input type="date" {...register('dateOfBirth')} />
        </label>

        <label className="form-field">
          <span>College name</span>
          <input type="text" {...register('collegeName')} />
        </label>

        <label className="form-field">
          <span>Passout year</span>
          <input type="number" {...register('passoutYear')} />
          {errors.passoutYear && (
            <small className="field-error">{errors.passoutYear.message}</small>
          )}
        </label>

        <label className="form-field">
          <span>Guardian name</span>
          <input type="text" {...register('guardianName')} />
        </label>

        <label className="form-field">
          <span>Emergency phone</span>
          <input type="tel" {...register('emergencyPhone')} />
        </label>

        <label className="form-field full-width">
          <span>Address line 1</span>
          <input type="text" {...register('addressLine1')} />
        </label>

        <label className="form-field full-width">
          <span>Address line 2</span>
          <input type="text" {...register('addressLine2')} />
        </label>

        {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

        {successMessage && <div className="alert success-alert">{successMessage}</div>}

        <button
          className="primary-button full-width"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : hasProfile
              ? 'Update profile'
              : 'Create profile'}
        </button>
      </form>
    </section>
  )
}
