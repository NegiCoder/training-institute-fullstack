import { env } from '@/config/env'

export function HomePage() {
  return (
    <section className="page-card">
      <p className="eyebrow">ExcelGens</p>
      <h1>Learn. Track. Certify.</h1>
      <p className="page-text">
        ExcelGens helps learners discover practical courses, track module progress, and
        earn verified certificates from one simple training platform.
      </p>

      <div className="info-list">
        <span>React + TypeScript</span>
        <span>Backend: {env.apiBaseUrl}</span>
        <span>JWT Auth Ready</span>
      </div>
    </section>
  )
}
