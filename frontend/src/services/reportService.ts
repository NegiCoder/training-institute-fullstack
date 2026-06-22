/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { apiClient } from '@/services/apiClient'
import type {
  CategoryPerformanceResponse,
  CoursePerformanceResponse,
  EnrollmentTrendPointResponse,
  ReportsOverviewResponse,
  StudentEngagementResponse,
  TopCourseMetric,
  TopCourseResponse,
  TrainerPerformanceResponse,
} from '@/types'

export const reportService = {
  async getOverview(): Promise<ReportsOverviewResponse> {
    const response = await apiClient.get<ReportsOverviewResponse>(
      '/api/reports/overview',
    )
    return response.data
  },

  async getCoursePerformance(): Promise<CoursePerformanceResponse[]> {
    const response = await apiClient.get<CoursePerformanceResponse[]>(
      '/api/reports/course-performance',
    )
    return response.data
  },

  async getTopCourses(
    metric: TopCourseMetric,
    limit = 10,
  ): Promise<TopCourseResponse[]> {
    const response = await apiClient.get<TopCourseResponse[]>(
      '/api/reports/top-courses',
      {
        params: {
          metric,
          limit,
        },
      },
    )
    return response.data
  },

  async getEnrollmentTrend(months = 12): Promise<EnrollmentTrendPointResponse[]> {
    const response = await apiClient.get<EnrollmentTrendPointResponse[]>(
      '/api/reports/enrollment-trend',
      {
        params: {
          months,
        },
      },
    )
    return response.data
  },

  async getTrainerPerformance(): Promise<TrainerPerformanceResponse[]> {
    const response = await apiClient.get<TrainerPerformanceResponse[]>(
      '/api/reports/trainer-performance',
    )
    return response.data
  },

  async getCategoryPerformance(): Promise<CategoryPerformanceResponse[]> {
    const response = await apiClient.get<CategoryPerformanceResponse[]>(
      '/api/reports/category-performance',
    )
    return response.data
  },

  async getStudentEngagement(
    idleDays = 60,
    limit = 10,
  ): Promise<StudentEngagementResponse> {
    const response = await apiClient.get<StudentEngagementResponse>(
      '/api/reports/student-engagement',
      {
        params: {
          idleDays,
          limit,
        },
      },
    )
    return response.data
  },

  async downloadCoursePerformanceCsv(): Promise<Blob> {
    const response = await apiClient.get('/api/reports/course-performance.csv', {
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadTopCoursesCsv(metric: TopCourseMetric, limit = 10): Promise<Blob> {
    const response = await apiClient.get('/api/reports/top-courses.csv', {
      params: { metric, limit },
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadEnrollmentTrendCsv(months = 12): Promise<Blob> {
    const response = await apiClient.get('/api/reports/enrollment-trend.csv', {
      params: { months },
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadTrainerPerformanceCsv(): Promise<Blob> {
    const response = await apiClient.get('/api/reports/trainer-performance.csv', {
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadCategoryPerformanceCsv(): Promise<Blob> {
    const response = await apiClient.get('/api/reports/category-performance.csv', {
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadStudentEngagementCsv(idleDays = 60, limit = 10): Promise<Blob> {
    const response = await apiClient.get('/api/reports/student-engagement.csv', {
      params: { idleDays, limit },
      responseType: 'blob',
    })
    return response.data as Blob
  },
}
