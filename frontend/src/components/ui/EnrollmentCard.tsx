/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { Link } from 'react-router-dom'
import type { EnrollmentResponse } from '@/types'
import { EnrollmentStatus } from '@/types'

function getStatusLabel(status: number): string {
  if (status === EnrollmentStatus.Assigned) return 'Assigned'
  if (status === EnrollmentStatus.InProgress) return 'In Progress'
  if (status === EnrollmentStatus.Completed) return 'Completed'
  if (status === EnrollmentStatus.Cancelled) return 'Cancelled'
  return 'Unknown'
}

type EnrollmentCardProps = {
  enrollment: EnrollmentResponse
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const progress = enrollment.progressPercentage

  return (
    <article className="lms-course-card lms-course-card--enrollment">
      <div className="lms-course-card__header">
        <span className="lms-course-card__category">
          {getStatusLabel(enrollment.status)}
        </span>
        <span className="lms-course-card__price">{progress}%</span>
      </div>

      <h3 className="lms-course-card__title">{enrollment.courseTitle}</h3>

      <p className="lms-course-card__desc">
        {new Date(enrollment.startDate).toLocaleDateString()} –{' '}
        {new Date(enrollment.endDate).toLocaleDateString()}
      </p>

      <div
        className="lms-course-card__progress"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="lms-course-card__progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="lms-course-card__progress-label">{progress}% complete</span>

      <Link
        className="lms-course-card__btn"
        to={`/student/enrollments/${enrollment.courseEnrollmentId}`}
      >
        Continue
      </Link>
    </article>
  )
}
