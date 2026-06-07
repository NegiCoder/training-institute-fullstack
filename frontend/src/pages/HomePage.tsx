import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseService } from '@/services/courseService'
import { CourseStatus, type CourseResponse } from '@/types'

// Course ka price label banata hai - Free / ₹amount / Paid
function getPriceLabel(course: CourseResponse): string {
  if (course.isFree) {
    return 'Free'
  }

  if (course.currentPrice != null) {
    return `₹${course.currentPrice}`
  }

  return 'Paid'
}

export function HomePage() {
  // Home page ke featured course cards yaha store hote hai
  const [featured, setFeatured] = useState<CourseResponse[]>([])

  useEffect(() => {
    // Page khulte hi featured courses load karte hai.
    // Pehle "featured" wale try karenge, na mile to latest published dikha denge,
    // taaki home page kabhi khali na lage.
    async function loadFeatured() {
      try {
        const featuredResult = await courseService.search({
          status: CourseStatus.Published,
          isFeatured: true,
          pageNumber: 1,
          pageSize: 6,
        })

        if (featuredResult.items.length > 0) {
          setFeatured(featuredResult.items)
          return
        }

        // Fallback: koi course featured nahi hai to latest published utha lo
        const latestResult = await courseService.search({
          status: CourseStatus.Published,
          pageNumber: 1,
          pageSize: 6,
        })
        setFeatured(latestResult.items)
      } catch {
        // Error aaye to section chhup jayega - broken box nahi dikhayenge
        setFeatured([])
      }
    }

    void loadFeatured()
  }, [])

  return (
    <div className="home">
      {/* Hero - sabse upar wala colorful welcome section */}
      <section className="hero">
        <div className="hero-content">
          <img src="/excelgens-logo.jpeg" alt="ExcelGens" className="hero-logo" />
          <p className="eyebrow hero-eyebrow">Welcome to ExcelGens</p>
          <h1>Learn. Track. Certify.</h1>
          <p className="hero-text">
            Discover practical, job-ready courses, track your progress module by module,
            and earn verified certificates you can share with anyone.
          </p>
          <div className="hero-actions">
            <Link className="hero-btn hero-btn-primary" to="/courses">
              Browse Courses
            </Link>
            <Link className="hero-btn hero-btn-ghost" to="/register">
              Join Free
            </Link>
          </div>
        </div>
      </section>

      {/* Value strip - 3 chhote points, bina kisi data ke bhi page bhara dikhta hai */}
      <section className="value-strip">
        <div className="value-card">
          <span className="value-icon">📚</span>
          <h3>Learn</h3>
          <p>Hands-on courses across development, data, cloud, and more.</p>
        </div>
        <div className="value-card">
          <span className="value-icon">📈</span>
          <h3>Track</h3>
          <p>Follow your module progress and stay on top of every course.</p>
        </div>
        <div className="value-card">
          <span className="value-icon">🎓</span>
          <h3>Certify</h3>
          <p>Earn verifiable certificates with a scannable QR code.</p>
        </div>
      </section>

      {/* Featured courses - tabhi dikhega jab API se courses mile */}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="section-heading">
            <h2>Featured Courses</h2>
            <Link className="section-link" to="/courses">
              View all courses →
            </Link>
          </div>

          <div className="course-grid">
            {featured.map((course) => (
              <article className="course-card" key={course.courseId}>
                <div className="course-card-header">
                  <span>{course.categoryName}</span>
                  <strong>{getPriceLabel(course)}</strong>
                </div>
                <h2>{course.title}</h2>
                <p>{course.description ?? 'No description available.'}</p>
                <div className="course-meta">
                  <span>{course.level}</span>
                  <span>{course.mode}</span>
                  <span>{course.duration}</span>
                </div>
                <Link className="course-link" to={`/courses/${course.courseId}`}>
                  View details
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
