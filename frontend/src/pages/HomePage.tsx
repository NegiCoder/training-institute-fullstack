import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseService } from '@/services/courseService'
import { CourseStatus, type CourseResponse } from '@/types'

// Recruiter/visitor ke liye ready-made demo logins.
// Har role ka ek account - taaki saari functionality try kar sake.
type DemoAccount = {
  role: string
  blurb: string
  email: string
  password: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Admin',
    blurb: 'Full access — manage courses, users, certificates & reports',
    email: 'admin@training.local',
    password: 'Admin@12345',
  },
  {
    role: 'Trainer',
    blurb: 'View assigned courses, modules & enrolled students',
    email: 'trainer.aman.sharma@training.local',
    password: 'Trainer@123',
  },
  {
    role: 'Student',
    blurb: 'Enroll, track progress & earn verified certificates',
    email: 'student001@training.local',
    password: 'Student@123',
  },
  {
    role: 'Business User',
    blurb: 'Read-only access to the reports dashboard',
    email: 'business@training.local',
    password: 'Business@123',
  },
]

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

  // Kaunsa demo account abhi-abhi copy hua - "Copied!" feedback dikhane ke liye
  const [copiedRole, setCopiedRole] = useState<string | null>(null)

  // Email + password ek saath clipboard me copy karta hai
  async function handleCopy(account: DemoAccount) {
    try {
      await navigator.clipboard.writeText(`${account.email} / ${account.password}`)
      setCopiedRole(account.role)
      window.setTimeout(() => setCopiedRole(null), 1500)
    } catch {
      // Clipboard block ho to chup-chaap ignore - user manually type kar sakta hai
    }
  }

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

      {/* Demo access - recruiter yaha se kisi bhi role me login kar sakta hai */}
      <section className="demo-section">
        <div className="demo-heading">
          <p className="eyebrow">Live demo — try it yourself</p>
          <h2>Recruiter access</h2>
          <p className="demo-subtext">
            This is a live demo with sample data. Pick any role below, copy the login,
            and explore every feature.
          </p>
        </div>

        <div className="demo-grid">
          {DEMO_ACCOUNTS.map((account) => (
            <article className="demo-card" key={account.role}>
              <span className="demo-role">{account.role}</span>
              <p className="demo-blurb">{account.blurb}</p>
              <div className="demo-cred">
                <span className="demo-cred-label">Email</span>
                <code>{account.email}</code>
              </div>
              <div className="demo-cred">
                <span className="demo-cred-label">Password</span>
                <code>{account.password}</code>
              </div>
              <button
                type="button"
                className="demo-copy-btn"
                onClick={() => void handleCopy(account)}
              >
                {copiedRole === account.role ? 'Copied!' : 'Copy login'}
              </button>
            </article>
          ))}
        </div>

        <div className="demo-actions">
          <Link className="hero-btn hero-btn-primary" to="/login">
            Go to Login
          </Link>
          <Link className="hero-btn hero-btn-ghost" to="/verify">
            Verify a Certificate
          </Link>
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
