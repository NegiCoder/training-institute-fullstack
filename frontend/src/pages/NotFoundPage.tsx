import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-card narrow-card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="page-text">The page you are trying to open does not exist.</p>
      <Link className="primary-link" to="/">
        Go back home
      </Link>
    </section>
  )
}
