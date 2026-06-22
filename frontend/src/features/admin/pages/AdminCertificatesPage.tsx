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
import { certificateService } from '@/services/certificateService'
import { enrollmentService } from '@/services/enrollmentService'
import {
  CertificateEmailStatus,
  type CertificateResponse,
  type EnrollmentResponse,
  EnrollmentStatus,
  type PagedResponse,
} from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const issueCertificateSchema = z.object({
  courseEnrollmentId: z.number().min(1, 'Enrollment id is required'),
})

type IssueCertificateFormValues = z.infer<typeof issueCertificateSchema>

function getEmailStatusLabel(status: number): string {
  if (status === CertificateEmailStatus.Pending) return 'Pending'
  if (status === CertificateEmailStatus.Sent) return 'Sent'
  if (status === CertificateEmailStatus.Failed) return 'Failed'
  return 'Unknown'
}

export function AdminCertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [emailStatus, setEmailStatus] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [certificates, setCertificates] =
    useState<PagedResponse<CertificateResponse> | null>(null)
  const [completedEnrollments, setCompletedEnrollments] = useState<
    EnrollmentResponse[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IssueCertificateFormValues>({
    resolver: zodResolver(issueCertificateSchema),
    defaultValues: {
      courseEnrollmentId: 0,
    },
  })

  async function loadCertificates() {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const result = await certificateService.search({
        searchTerm: searchTerm.trim() || undefined,
        emailStatus: emailStatus
          ? (Number(emailStatus) as CertificateEmailStatus)
          : undefined,
        pageNumber,
        pageSize: 10,
      })
      setCertificates(result)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCompletedEnrollments() {
    try {
      setIsLoadingEnrollments(true)
      const result = await enrollmentService.searchEnrollments({
        status: EnrollmentStatus.Completed,
        pageNumber: 1,
        pageSize: 50,
      })
      setCompletedEnrollments(result.items)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoadingEnrollments(false)
    }
  }

  useEffect(() => {
    void loadCertificates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber])

  useEffect(() => {
    void loadCompletedEnrollments()
  }, [])

  function handleSearch() {
    setPageNumber(1)
    void loadCertificates()
  }

  async function onSubmit(values: IssueCertificateFormValues) {
    try {
      setErrorMessage('')
      setSuccessMessage('')
      await certificateService.issueCertificate(values)
      setSuccessMessage('Certificate issued successfully.')
      reset({ courseEnrollmentId: 0 })
      await Promise.all([loadCertificates(), loadCompletedEnrollments()])
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleDownload(certificate: CertificateResponse) {
    try {
      setDownloadingId(certificate.certificateIssuedId)
      setErrorMessage('')
      const fileBlob = await certificateService.downloadCertificate(
        certificate.certificateIssuedId,
      )
      const fileUrl = URL.createObjectURL(fileBlob)
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = `${certificate.certificateNumber}.pdf`
      link.click()
      URL.revokeObjectURL(fileUrl)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Admin</p>
      <h1>Certificates</h1>
      <p className="page-text">
        Issue certificates, search issued certificates, and download PDFs.
      </p>

      <form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Completed enrollment</span>
          <select
            {...register('courseEnrollmentId', { valueAsNumber: true })}
            disabled={isLoadingEnrollments}
          >
            <option value={0}>
              {isLoadingEnrollments
                ? 'Loading enrollments...'
                : completedEnrollments.length === 0
                  ? 'No completed enrollments'
                  : 'Select a completed enrollment'}
            </option>
            {completedEnrollments.map((enrollment) => (
              <option
                key={enrollment.courseEnrollmentId}
                value={enrollment.courseEnrollmentId}
              >
                {enrollment.studentName} - {enrollment.courseTitle} (#
                {enrollment.courseEnrollmentId})
              </option>
            ))}
          </select>
          {errors.courseEnrollmentId && (
            <small className="field-error">{errors.courseEnrollmentId.message}</small>
          )}
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          Issue certificate
        </button>
      </form>

      <div className="filter-grid">
        <input
          type="search"
          placeholder="Search certificate/student/course..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select
          value={emailStatus}
          onChange={(event) => setEmailStatus(event.target.value)}
        >
          <option value="">All email statuses</option>
          <option value={CertificateEmailStatus.Pending}>Pending</option>
          <option value={CertificateEmailStatus.Sent}>Sent</option>
          <option value={CertificateEmailStatus.Failed}>Failed</option>
        </select>
        <button className="secondary-button" type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}
      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      {isLoading && <p className="page-text">Loading certificates...</p>}

      {!isLoading && !errorMessage && certificates?.items.length === 0 && (
        <div className="empty-state">No certificates found.</div>
      )}

      {!isLoading && !errorMessage && certificates && certificates.items.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Number</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Email</th>
                  <th>Issued</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {certificates.items.map((certificate) => (
                  <tr key={certificate.certificateIssuedId}>
                    <td>{certificate.certificateIssuedId}</td>
                    <td>{certificate.certificateNumber}</td>
                    <td>{certificate.studentName}</td>
                    <td>{certificate.courseTitle}</td>
                    <td>{getEmailStatusLabel(certificate.emailStatus)}</td>
                    <td>{new Date(certificate.issuedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={downloadingId === certificate.certificateIssuedId}
                        onClick={() => handleDownload(certificate)}
                      >
                        {downloadingId === certificate.certificateIssuedId
                          ? 'Downloading...'
                          : 'PDF'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <button
              className="secondary-button"
              type="button"
              disabled={!certificates.hasPreviousPage}
              onClick={() => setPageNumber((page) => page - 1)}
            >
              Previous
            </button>
            <span>
              Page {certificates.pageNumber} of {certificates.totalPages}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={!certificates.hasNextPage}
              onClick={() => setPageNumber((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}
