import { env } from '@/config/env'

export function HomePage() {
  return (
    <section className="page-card">
      <p className="eyebrow">Training Institute</p>
      <h1>Learn. Track. Certify.</h1>
      <p className="page-text">
        This frontend will connect to your ASP.NET Core API, support role-based
        dashboards, and manage courses, enrollments, progress, and certificates.
      </p>

      <div className="info-list">
        <span>React + TypeScript</span>
        <span>Backend: {env.apiBaseUrl}</span>
        <span>JWT Auth Ready</span>
      </div>
    </section>
  )
}
