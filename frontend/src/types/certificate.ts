import type { CertificateEmailStatus } from '@/types/enums'

export type CertificateResponse = {
  certificateIssuedId: number
  courseEnrollmentId: number
  certificateNumber: string
  studentName: string
  courseTitle: string
  issuedAt: string
  pdfPath: string
  emailStatus: CertificateEmailStatus
  emailSentAt?: string | null
  createdAt: string
}

export type IssueCertificateRequest = {
  courseEnrollmentId: number
}

export type CertificateVerifyResponse = {
  isValid: boolean
  certificateNumber: string
  studentName?: string | null
  courseTitle?: string | null
  issuedAt?: string | null
  issuedBy: string
}

export type CertificateSearchRequest = {
  searchTerm?: string
  courseEnrollmentId?: number
  studentId?: number
  courseId?: number
  emailStatus?: CertificateEmailStatus
  issuedFrom?: string
  issuedTo?: string
  pageNumber: number
  pageSize: number
}
