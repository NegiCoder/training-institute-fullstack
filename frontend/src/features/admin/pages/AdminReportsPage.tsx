/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useMemo, useState } from 'react'
import { reportService } from '@/services/reportService'
import type {
  CategoryPerformanceResponse,
  CoursePerformanceResponse,
  EnrollmentTrendPointResponse,
  ReportsOverviewResponse,
  StudentEngagementResponse,
  TopCourseResponse,
  TrainerPerformanceResponse,
} from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

type ReportTab =
  | 'overview'
  | 'courses'
  | 'top'
  | 'trend'
  | 'trainers'
  | 'categories'
  | 'students'

type CourseSortKey =
  | 'courseTitle'
  | 'totalEnrollments'
  | 'inProgressCount'
  | 'completedCount'
  | 'certificatesIssued'
  | 'completionRate'
  | 'averageProgressPercentage'

type CourseFilters = {
  search: string
  categoryName: string
  status: string
  price: '' | 'free' | 'paid'
  minEnrollments: string
}

const TABS: Array<{ id: ReportTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Course Performance' },
  { id: 'top', label: 'Top Courses' },
  { id: 'trend', label: 'Enrollment Trend' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'categories', label: 'Categories' },
  { id: 'students', label: 'Students' },
]

const TREND_RANGES = [3, 6, 12, 24] as const
type TrendRange = (typeof TREND_RANGES)[number]

const DEFAULT_FILTERS: CourseFilters = {
  search: '',
  categoryName: '',
  status: '',
  price: '',
  minEnrollments: '',
}

function formatPrice(row: CoursePerformanceResponse): string {
  if (row.isFree) {
    return 'Free'
  }

  if (row.currentPrice != null) {
    return `₹${row.currentPrice}`
  }

  return 'Paid'
}

function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`
}

function getCompletionRateClass(rate: number): string {
  if (rate < 30) {
    return 'rate-pill rate-low'
  }

  if (rate < 60) {
    return 'rate-pill rate-mid'
  }

  return 'rate-pill rate-high'
}

function getSortIndicator(active: boolean, dir: 'asc' | 'desc'): string {
  if (!active) {
    return ''
  }

  return dir === 'asc' ? ' ▲' : ' ▼'
}

function downloadBlob(blob: Blob, fileName: string) {
  const fileUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(fileUrl)
}

function timestampSuffix(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function formatLastEnrollment(value: string | null): string {
  if (!value) {
    return 'Never enrolled'
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString()
}

export function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview')

  const [overview, setOverview] = useState<ReportsOverviewResponse | null>(null)
  const [coursePerformance, setCoursePerformance] = useState<
    CoursePerformanceResponse[]
  >([])
  const [topEnrollmentCourses, setTopEnrollmentCourses] = useState<TopCourseResponse[]>(
    [],
  )
  const [topCertificateCourses, setTopCertificateCourses] = useState<
    TopCourseResponse[]
  >([])
  const [enrollmentTrend, setEnrollmentTrend] = useState<
    EnrollmentTrendPointResponse[]
  >([])
  const [trainerPerformance, setTrainerPerformance] = useState<
    TrainerPerformanceResponse[]
  >([])
  const [categoryPerformance, setCategoryPerformance] = useState<
    CategoryPerformanceResponse[]
  >([])
  const [studentEngagement, setStudentEngagement] =
    useState<StudentEngagementResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [exportingKey, setExportingKey] = useState<string | null>(null)

  const [filters, setFilters] = useState<CourseFilters>(DEFAULT_FILTERS)
  const [sortKey, setSortKey] = useState<CourseSortKey>('totalEnrollments')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const [trendRange, setTrendRange] = useState<TrendRange>(12)
  const [isTrendLoading, setIsTrendLoading] = useState(false)

  useEffect(() => {
    async function loadReports() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [
          overviewResult,
          performanceResult,
          topEnrollmentsResult,
          topCertificatesResult,
          trendResult,
          trainerResult,
          categoryResult,
          engagementResult,
        ] = await Promise.all([
          reportService.getOverview(),
          reportService.getCoursePerformance(),
          reportService.getTopCourses('enrollments', 10),
          reportService.getTopCourses('certificates', 10),
          reportService.getEnrollmentTrend(trendRange),
          reportService.getTrainerPerformance(),
          reportService.getCategoryPerformance(),
          reportService.getStudentEngagement(60, 10),
        ])

        setOverview(overviewResult)
        setCoursePerformance(performanceResult)
        setTopEnrollmentCourses(topEnrollmentsResult)
        setTopCertificateCourses(topCertificatesResult)
        setEnrollmentTrend(trendResult)
        setTrainerPerformance(trainerResult)
        setCategoryPerformance(categoryResult)
        setStudentEngagement(engagementResult)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function changeTrendRange(months: TrendRange) {
    if (months === trendRange) {
      return
    }

    setTrendRange(months)

    try {
      setIsTrendLoading(true)
      const trend = await reportService.getEnrollmentTrend(months)
      setEnrollmentTrend(trend)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsTrendLoading(false)
    }
  }

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()

    for (const course of coursePerformance) {
      if (course.categoryName) {
        set.add(course.categoryName)
      }
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [coursePerformance])

  const filteredCourses = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase()
    const minEnrollments = filters.minEnrollments
      ? Number.parseInt(filters.minEnrollments, 10)
      : 0

    const rows = coursePerformance.filter((course) => {
      if (searchTerm && !course.courseTitle.toLowerCase().includes(searchTerm)) {
        return false
      }

      if (filters.categoryName && course.categoryName !== filters.categoryName) {
        return false
      }

      if (filters.status && course.status !== filters.status) {
        return false
      }

      if (filters.price === 'free' && !course.isFree) {
        return false
      }

      if (filters.price === 'paid' && course.isFree) {
        return false
      }

      if (minEnrollments > 0 && course.totalEnrollments < minEnrollments) {
        return false
      }

      return true
    })

    const sorted = [...rows].sort((a, b) => {
      if (sortKey === 'courseTitle') {
        const cmp = a.courseTitle.localeCompare(b.courseTitle)
        return sortDir === 'asc' ? cmp : -cmp
      }

      const aValue = a[sortKey]
      const bValue = b[sortKey]
      const cmp = (aValue as number) - (bValue as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return sorted
  }, [coursePerformance, filters, sortKey, sortDir])

  function toggleSort(key: CourseSortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)
    setSortDir(key === 'courseTitle' ? 'asc' : 'desc')
  }

  function resetCourseFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  async function runExport(key: string, action: () => Promise<Blob>, fileBase: string) {
    try {
      setExportingKey(key)
      setErrorMessage('')
      const blob = await action()
      downloadBlob(blob, `${fileBase}-${timestampSuffix()}.csv`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setExportingKey(null)
    }
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero" aria-labelledby="reports-title">
        <p className="dashboard-hero__eyebrow">Reports</p>
        <h1 id="reports-title" className="dashboard-hero__title">
          Analytics Dashboard
        </h1>
        <p className="dashboard-hero__text">
          Track enrollments, course completion, certificates, and engagement.
        </p>
      </section>

      <section className="page-card reports-page">
        <p className="eyebrow visually-hidden">Admin</p>

        {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

        {isLoading && <p className="page-text">Loading reports...</p>}

        {!isLoading && !errorMessage && (
          <>
            <nav className="report-tabs" aria-label="Report sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`report-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {activeTab === 'overview' && overview && (
              <div className="dashboard-grid reports-kpi-grid">
                <div className="dashboard-card">
                  <span>Total Students</span>
                  <strong>{overview.totalStudents}</strong>
                </div>
                <div className="dashboard-card">
                  <span>Total Trainers</span>
                  <strong>{overview.totalTrainers}</strong>
                </div>
                <div className="dashboard-card">
                  <span>Total Courses</span>
                  <strong>{overview.totalCourses}</strong>
                </div>
                <div className="dashboard-card">
                  <span>Published / Draft</span>
                  <strong>
                    {overview.publishedCourses} / {overview.draftCourses}
                  </strong>
                </div>
                <div className="dashboard-card">
                  <span>Total Enrollments</span>
                  <strong>{overview.totalEnrollments}</strong>
                </div>
                <div className="dashboard-card">
                  <span>Active Enrollments</span>
                  <strong>{overview.activeEnrollments}</strong>
                </div>
                <div className="dashboard-card">
                  <span>Completed Enrollments</span>
                  <strong>{overview.completedEnrollments}</strong>
                </div>
                <div className="dashboard-card">
                  <span>Certificates Issued</span>
                  <strong>{overview.totalCertificates}</strong>
                </div>
                <div className="dashboard-card">
                  <span>Overall Completion Rate</span>
                  <strong>{formatPercent(overview.overallCompletionRate)}</strong>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Course Performance</h2>
                    <p>
                      Enrollments, progress, completion, and certificate totals by
                      course.
                    </p>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={exportingKey === 'course'}
                    onClick={() =>
                      void runExport(
                        'course',
                        () => reportService.downloadCoursePerformanceCsv(),
                        'course-performance',
                      )
                    }
                  >
                    {exportingKey === 'course' ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>

                <div className="filter-grid report-filter-grid">
                  <input
                    type="search"
                    placeholder="Search by course title..."
                    value={filters.search}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />

                  <select
                    value={filters.categoryName}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        categoryName: event.target.value,
                      }))
                    }
                  >
                    <option value="">All categories</option>
                    {categoryOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="">Draft + Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>

                  <select
                    value={filters.price}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        price: event.target.value as CourseFilters['price'],
                      }))
                    }
                  >
                    <option value="">All prices</option>
                    <option value="free">Free only</option>
                    <option value="paid">Paid only</option>
                  </select>

                  <input
                    type="number"
                    min={0}
                    placeholder="Min enrollments"
                    value={filters.minEnrollments}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        minEnrollments: event.target.value,
                      }))
                    }
                  />

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={resetCourseFilters}
                  >
                    Clear filters
                  </button>
                </div>

                <p className="page-text muted">
                  Showing {filteredCourses.length} of {coursePerformance.length} courses
                </p>

                <div className="admin-table-wrap">
                  <table className="admin-table sortable-table">
                    <thead>
                      <tr>
                        <th
                          className="sortable"
                          onClick={() => toggleSort('courseTitle')}
                        >
                          Course
                          {getSortIndicator(sortKey === 'courseTitle', sortDir)}
                        </th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort('totalEnrollments')}
                        >
                          Enrolled
                          {getSortIndicator(sortKey === 'totalEnrollments', sortDir)}
                        </th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort('inProgressCount')}
                        >
                          In Progress
                          {getSortIndicator(sortKey === 'inProgressCount', sortDir)}
                        </th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort('completedCount')}
                        >
                          Completed
                          {getSortIndicator(sortKey === 'completedCount', sortDir)}
                        </th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort('certificatesIssued')}
                        >
                          Certificates
                          {getSortIndicator(sortKey === 'certificatesIssued', sortDir)}
                        </th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort('completionRate')}
                        >
                          Completion %
                          {getSortIndicator(sortKey === 'completionRate', sortDir)}
                        </th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort('averageProgressPercentage')}
                        >
                          Avg Progress
                          {getSortIndicator(
                            sortKey === 'averageProgressPercentage',
                            sortDir,
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr key={course.courseId}>
                          <td>{course.courseTitle}</td>
                          <td>{course.categoryName}</td>
                          <td>
                            <span
                              className={`chip status-${course.status.toLowerCase()}`}
                            >
                              {course.status}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`chip ${course.isFree ? 'chip-free' : 'chip-paid'}`}
                            >
                              {formatPrice(course)}
                            </span>
                          </td>
                          <td>{course.totalEnrollments}</td>
                          <td>{course.inProgressCount}</td>
                          <td>{course.completedCount}</td>
                          <td>{course.certificatesIssued}</td>
                          <td>
                            <span
                              className={getCompletionRateClass(course.completionRate)}
                            >
                              {formatPercent(course.completionRate)}
                            </span>
                          </td>
                          <td>{formatPercent(course.averageProgressPercentage)}</td>
                        </tr>
                      ))}

                      {filteredCourses.length === 0 && (
                        <tr>
                          <td colSpan={10}>
                            <div className="empty-state">
                              No courses match the current filters.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'top' && (
              <div className="report-grid">
                <ReportTopList
                  title="Top Courses by Enrollment"
                  subtitle="Top 10 courses ranked by total enrollments."
                  rows={topEnrollmentCourses}
                  emptyText="No enrollments yet."
                  isExporting={exportingKey === 'top-enrollments'}
                  onExport={() =>
                    void runExport(
                      'top-enrollments',
                      () => reportService.downloadTopCoursesCsv('enrollments', 10),
                      'top-courses-enrollments',
                    )
                  }
                />
                <ReportTopList
                  title="Top Courses by Certificates"
                  subtitle="Top 10 courses ranked by certificates issued."
                  rows={topCertificateCourses}
                  emptyText="No certificates issued yet."
                  isExporting={exportingKey === 'top-certificates'}
                  onExport={() =>
                    void runExport(
                      'top-certificates',
                      () => reportService.downloadTopCoursesCsv('certificates', 10),
                      'top-courses-certificates',
                    )
                  }
                />
              </div>
            )}

            {activeTab === 'trend' && (
              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Enrollment Trend</h2>
                    <p>Monthly enrollment count for the selected time range.</p>
                  </div>
                  <div className="trend-actions">
                    <div className="trend-range-toggle">
                      {TREND_RANGES.map((range) => (
                        <button
                          key={range}
                          type="button"
                          className={`secondary-button ${trendRange === range ? 'is-active' : ''}`}
                          onClick={() => void changeTrendRange(range)}
                          disabled={isTrendLoading && trendRange !== range}
                        >
                          {range}m
                        </button>
                      ))}
                    </div>
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={exportingKey === 'trend'}
                      onClick={() =>
                        void runExport(
                          'trend',
                          () => reportService.downloadEnrollmentTrendCsv(trendRange),
                          `enrollment-trend-${trendRange}mo`,
                        )
                      }
                    >
                      {exportingKey === 'trend' ? 'Exporting...' : 'Export CSV'}
                    </button>
                  </div>
                </div>

                {isTrendLoading ? (
                  <p className="page-text">Loading trend...</p>
                ) : (
                  <div className="trend-grid">
                    {enrollmentTrend.map((point) => (
                      <div className="trend-card" key={`${point.year}-${point.month}`}>
                        <span>{point.label}</span>
                        <strong>{point.enrollmentCount}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trainers' && (
              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Trainer Performance</h2>
                    <p>Workload and outcomes per trainer.</p>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={exportingKey === 'trainer'}
                    onClick={() =>
                      void runExport(
                        'trainer',
                        () => reportService.downloadTrainerPerformanceCsv(),
                        'trainer-performance',
                      )
                    }
                  >
                    {exportingKey === 'trainer' ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>

                {trainerPerformance.length === 0 ? (
                  <div className="empty-state">No trainer activity to report.</div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Trainer</th>
                          <th>Email</th>
                          <th>Courses</th>
                          <th>Students</th>
                          <th>Completed</th>
                          <th>Certificates</th>
                          <th>Avg Completion %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trainerPerformance.map((trainer) => (
                          <tr key={trainer.trainerId}>
                            <td>{trainer.trainerName}</td>
                            <td>{trainer.email}</td>
                            <td>{trainer.coursesAssigned}</td>
                            <td>{trainer.totalStudents}</td>
                            <td>{trainer.completedStudents}</td>
                            <td>{trainer.certificatesIssued}</td>
                            <td>
                              <span
                                className={getCompletionRateClass(
                                  trainer.averageCompletionRate,
                                )}
                              >
                                {formatPercent(trainer.averageCompletionRate)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Category Breakdown</h2>
                    <p>Enrollment health by course category.</p>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={exportingKey === 'category'}
                    onClick={() =>
                      void runExport(
                        'category',
                        () => reportService.downloadCategoryPerformanceCsv(),
                        'category-performance',
                      )
                    }
                  >
                    {exportingKey === 'category' ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>

                {categoryPerformance.length === 0 ? (
                  <div className="empty-state">No categories with active courses.</div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Courses</th>
                          <th>Enrollments</th>
                          <th>Completed</th>
                          <th>Certificates</th>
                          <th>Avg Completion %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryPerformance.map((category) => (
                          <tr key={category.categoryId}>
                            <td>{category.categoryName}</td>
                            <td>{category.totalCourses}</td>
                            <td>{category.totalEnrollments}</td>
                            <td>{category.completedEnrollments}</td>
                            <td>{category.certificatesIssued}</td>
                            <td>
                              <span
                                className={getCompletionRateClass(
                                  category.averageCompletionRate,
                                )}
                              >
                                {formatPercent(category.averageCompletionRate)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && studentEngagement && (
              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Student Engagement</h2>
                    <p>
                      Top students by certificates earned and students with no
                      enrollment in the last 60 days.
                    </p>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={exportingKey === 'engagement'}
                    onClick={() =>
                      void runExport(
                        'engagement',
                        () => reportService.downloadStudentEngagementCsv(60, 10),
                        'student-engagement',
                      )
                    }
                  >
                    {exportingKey === 'engagement' ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>

                <div className="engagement-grid two-cols">
                  <div className="engagement-card">
                    <h3>Top by Certificates</h3>
                    <p className="muted small-text">
                      Ranked by total certificates earned.
                    </p>

                    {studentEngagement.topByCertificates.length === 0 ? (
                      <div className="empty-state">No certificates issued yet.</div>
                    ) : (
                      <ol className="report-rank-list">
                        {studentEngagement.topByCertificates.map((student) => (
                          <li key={student.studentId}>
                            <div>
                              <strong>{student.studentName}</strong>
                              <span>{student.email}</span>
                            </div>
                            <b>{student.certificatesEarned}</b>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="engagement-card">
                    <h3>Idle Students</h3>
                    <p className="muted small-text">
                      No new enrollment in the last 60 days.
                    </p>

                    {studentEngagement.idleStudents.length === 0 ? (
                      <div className="empty-state">All students are active.</div>
                    ) : (
                      <ul className="report-rank-list idle-list">
                        {studentEngagement.idleStudents.map((student) => (
                          <li key={student.studentId}>
                            <div>
                              <strong>{student.studentName}</strong>
                              <span>{student.email}</span>
                              <span className="muted small-text">
                                Last enrolled:{' '}
                                {formatLastEnrollment(student.lastEnrollmentAt)}
                              </span>
                            </div>
                            <b>
                              {student.lastEnrollmentAt
                                ? `${student.daysSinceLastEnrollment}d`
                                : '—'}
                            </b>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function ReportTopList({
  title,
  subtitle,
  rows,
  emptyText,
  isExporting,
  onExport,
}: {
  title: string
  subtitle: string
  rows: TopCourseResponse[]
  emptyText: string
  isExporting: boolean
  onExport: () => void
}) {
  return (
    <section className="report-section">
      <div className="report-section-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          disabled={isExporting}
          onClick={onExport}
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">{emptyText}</div>
      ) : (
        <ol className="report-rank-list">
          {rows.map((row) => (
            <li key={row.courseId}>
              <div>
                <strong>{row.courseTitle}</strong>
                <span>{row.categoryName}</span>
              </div>
              <b>{row.count}</b>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
