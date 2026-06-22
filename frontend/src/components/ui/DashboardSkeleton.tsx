/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

type DashboardSkeletonProps = {
  statCount?: number
  cardCount?: number
}

export function DashboardSkeleton({
  statCount = 4,
  cardCount = 3,
}: DashboardSkeletonProps) {
  return (
    <div className="dashboard-skeleton" aria-busy="true" aria-label="Loading dashboard">
      <div className="dashboard-skeleton__hero" />
      <div className="dashboard-skeleton__stats">
        {Array.from({ length: statCount }).map((_, i) => (
          <div className="dashboard-skeleton__stat" key={i} />
        ))}
      </div>
      <div className="dashboard-skeleton__cards">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div className="dashboard-skeleton__card" key={i} />
        ))}
      </div>
    </div>
  )
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="course-grid course-grid--loading"
      aria-busy="true"
      aria-label="Loading courses"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div className="dashboard-skeleton__card" key={i} />
      ))}
    </div>
  )
}
