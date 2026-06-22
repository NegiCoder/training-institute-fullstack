/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

export type PagedResponse<T> = {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type ApiMessageResponse = {
  message: string
}

export type ValidationErrorResponse = {
  type: string
  title: string
  status: number
  errors: Record<string, string[]>
  traceId: string
}

export type ApiErrorResponse = ApiMessageResponse | ValidationErrorResponse
