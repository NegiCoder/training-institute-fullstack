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
