import { Link } from 'react-router-dom'
import type { CourseResponse } from '@/types'

function getPriceLabel(course: CourseResponse): string {
  if (course.isFree) return 'Free'
  if (course.currentPrice != null) return `₹${course.currentPrice}`
  return 'Paid'
}

type CourseCardProps = {
  course: CourseResponse
  linkTo?: string
  linkLabel?: string
}

export function CourseCard({
  course,
  linkTo,
  linkLabel = 'View details',
}: CourseCardProps) {
  const href = linkTo ?? `/courses/${course.courseId}`

  return (
    <article className="lms-course-card">
      <div className="lms-course-card__header">
        <span className="lms-course-card__category">{course.categoryName}</span>
        <div className="lms-course-card__badges">
          {course.isFeatured && (
            <span className="lms-course-card__badge lms-course-card__badge--featured">
              Featured
            </span>
          )}
          <span className="lms-course-card__price">{getPriceLabel(course)}</span>
        </div>
      </div>

      <h3 className="lms-course-card__title">{course.title}</h3>

      {course.description && (
        <p className="lms-course-card__desc">{course.description}</p>
      )}

      <div className="lms-course-card__meta">
        <span>{course.level}</span>
        <span>{course.mode}</span>
        <span>{course.duration}</span>
      </div>

      <Link className="lms-course-card__btn" to={href}>
        {linkLabel}
      </Link>
    </article>
  )
}
