/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import axios from 'axios'
import type { ApiErrorResponse } from '@/types'

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return 'Something went wrong. Please try again.'
  }

  const responseData = error.response?.data

  if (!responseData) {
    return 'Unable to connect to the server.'
  }

  if ('message' in responseData) {
    return responseData.message
  }

  if ('errors' in responseData) {
    const firstError = Object.values(responseData.errors).flat()[0]
    return firstError ?? responseData.title
  }

  return 'Something went wrong. Please try again.'
}
