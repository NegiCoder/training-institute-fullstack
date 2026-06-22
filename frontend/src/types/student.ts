/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

export type CreateStudentProfileRequest = {
  firstName: string
  lastName: string
  phone?: string | null
  city?: string | null
  dateOfBirth?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  guardianName?: string | null
  emergencyPhone?: string | null
  collegeName?: string | null
  passoutYear?: number | null
}

export type UpdateStudentProfileRequest = CreateStudentProfileRequest

export type StudentProfileResponse = {
  studentId: number
  userId: number
  fullName: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  city?: string | null
  dateOfBirth?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  guardianName?: string | null
  emergencyPhone?: string | null
  collegeName?: string | null
  passoutYear?: number | null
  createdAt: string
  updatedAt?: string | null
}

export type StudentSearchRequest = {
  searchTerm?: string
  city?: string
  collegeName?: string
  passoutYear?: number
  pageNumber: number
  pageSize: number
}
