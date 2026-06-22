/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

export const UserRole = {
  Student: 1,
  Trainer: 2,
  Admin: 3,
  // BusinessUser sirf reports dashboard dekh sakta hai
  BusinessUser: 4,
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const CourseStatus = {
  Draft: 1,
  Published: 2,
  Archived: 3,
} as const

export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus]

export const EnrollmentStatus = {
  Assigned: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4,
} as const

export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus]

export const ContentType = {
  Video: 1,
  Pdf: 2,
  Link: 3,
} as const

export type ContentType = (typeof ContentType)[keyof typeof ContentType]

export const CertificateEmailStatus = {
  Pending: 1,
  Sent: 2,
  Failed: 3,
} as const

export type CertificateEmailStatus =
  (typeof CertificateEmailStatus)[keyof typeof CertificateEmailStatus]
