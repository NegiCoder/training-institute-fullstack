import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DemoHintToast } from '@/components/DemoHintToast'
import { CourseCard } from '@/components/ui/CourseCard'
import { CourseGridSkeleton } from '@/components/ui/DashboardSkeleton'
import { courseService } from '@/services/courseService'
import { CourseStatus, type CourseResponse } from '@/types'

type HomeTab = 'courses' | 'demo'

type DemoAccount = {
  role: string
  icon: string
  blurb: string
  email: string
  password: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Admin',
    icon: '🛡️',
    blurb: 'Full access — manage courses, users, certificates & reports',
    email: 'admin@training.local',
    password: 'Admin@12345',
  },
  {
    role: 'Trainer',
    icon: '🧑‍🏫',
    blurb: 'View assigned courses, modules & enrolled students',
    email: 'trainer.aman.sharma@training.local',
    password: 'Trainer@123',
  },
  {
    role: 'Student',
    icon: '🎓',
    blurb: 'Enroll, track progress & earn verified certificates',
    email: 'student001@training.local',
    password: 'Student@123',
  },
  {
    role: 'Business User',
    icon: '📊',
    blurb: 'Read-only access to the reports dashboard',
    email: 'business@training.local',
    password: 'Business@123',
  },
]

export function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>('courses')
  const [featured, setFeatured] = useState<CourseResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const demoSectionRef = useRef<HTMLElement>(null)

  function openDemoTab() {
    setActiveTab('demo')
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        demoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    })
  }

  async function handleCopy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  useEffect(() => {
    async function loadFeatured() {
      setIsLoading(true)
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

        const latestResult = await courseService.search({
          status: CourseStatus.Published,
          pageNumber: 1,
          pageSize: 6,
        })
        setFeatured(latestResult.items)
      } catch {
        setFeatured([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadFeatured()
  }, [])

  return (
    <div className="home">
      <DemoHintToast onOpenDemo={openDemoTab} />

      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Welcome to ExcelGens</p>
          <h1 id="home-hero-title" className="home-hero__title">
            Learn. Track. Certify.
          </h1>
          <p className="home-hero__text">
            Discover practical, job-ready courses, track your progress module by module,
            and earn verified certificates you can share with anyone.
          </p>
          <div className="home-hero__actions">
            <Link className="home-btn home-btn--primary" to="/courses">
              Browse Courses
            </Link>
            <button
              type="button"
              className="home-btn home-btn--ghost"
              onClick={openDemoTab}
            >
              Try Live Demo
            </button>
            <Link className="home-btn home-btn--ghost" to="/register">
              Join Free
            </Link>
          </div>
        </div>
      </section>

      <section className="home-stats" aria-label="Platform highlights">
        <article className="home-stat">
          <span className="home-stat__icon" aria-hidden="true">
            📚
          </span>
          <h2 className="home-stat__title">Learn</h2>
          <p className="home-stat__text">
            Hands-on courses across development, data, cloud, and more.
          </p>
        </article>
        <article className="home-stat">
          <span className="home-stat__icon" aria-hidden="true">
            📈
          </span>
          <h2 className="home-stat__title">Track</h2>
          <p className="home-stat__text">
            Follow your module progress and stay on top of every course.
          </p>
        </article>
        <article className="home-stat">
          <span className="home-stat__icon" aria-hidden="true">
            🎓
          </span>
          <h2 className="home-stat__title">Certify</h2>
          <p className="home-stat__text">
            Earn verifiable certificates with a scannable QR code.
          </p>
        </article>
      </section>

      <section
        ref={demoSectionRef}
        className="home-tabs-panel"
        id="live-demo-section"
        aria-labelledby="home-tabs-heading"
      >
        <div className="home-tabs-panel__head">
          <h2 id="home-tabs-heading" className="visually-hidden">
            Explore ExcelGens
          </h2>
          <div className="home-tabs" role="tablist" aria-label="Home page sections">
            <button
              type="button"
              role="tab"
              id="home-tab-courses"
              className={`home-tabs__btn${activeTab === 'courses' ? ' home-tabs__btn--active' : ''}`}
              aria-selected={activeTab === 'courses'}
              aria-controls="home-panel-courses"
              onClick={() => setActiveTab('courses')}
            >
              Featured Courses
            </button>
            <button
              type="button"
              role="tab"
              id="home-tab-demo"
              className={`home-tabs__btn${activeTab === 'demo' ? ' home-tabs__btn--active' : ''}`}
              aria-selected={activeTab === 'demo'}
              aria-controls="home-panel-demo"
              onClick={openDemoTab}
            >
              Live Demo
            </button>
          </div>
          {activeTab === 'courses' && (
            <Link className="home-section__link" to="/courses">
              View all courses →
            </Link>
          )}
        </div>

        <div
          role="tabpanel"
          id="home-panel-courses"
          aria-labelledby="home-tab-courses"
          className={`home-tabs-panel__body${activeTab === 'courses' ? '' : ' home-tabs-panel__body--hidden'}`}
          hidden={activeTab !== 'courses'}
        >
          {isLoading && <CourseGridSkeleton count={6} />}

          {!isLoading && featured.length > 0 && (
            <div className="course-grid">
              {featured.map((course) => (
                <CourseCard key={course.courseId} course={course} />
              ))}
            </div>
          )}

          {!isLoading && featured.length === 0 && (
            <p className="page-text">No published courses available right now.</p>
          )}
        </div>

        <div
          role="tabpanel"
          id="home-panel-demo"
          aria-labelledby="home-tab-demo"
          className={`home-tabs-panel__body home-demo${activeTab === 'demo' ? '' : ' home-tabs-panel__body--hidden'}`}
          hidden={activeTab !== 'demo'}
        >
          <div className="home-demo__head">
            <p className="home-hero__eyebrow" style={{ color: 'var(--primary)' }}>
              Live demo — try it yourself
            </p>
            <p className="home-demo__head-text">
              This is a live demo with sample data. Pick any role below, copy the login,
              and explore every feature.
            </p>
          </div>

          <div className="home-demo__grid">
            {DEMO_ACCOUNTS.map((account) => (
              <article className="home-demo-card" key={account.role}>
                <div className="home-demo-card__top">
                  <span aria-hidden="true">{account.icon}</span>
                  <span className="home-demo-card__role">{account.role}</span>
                </div>
                <p className="home-demo-card__blurb">{account.blurb}</p>

                <div className="home-demo-card__cred">
                  <span className="home-demo-card__label">Email</span>
                  <code className="home-demo-card__value" title={account.email}>
                    {account.email}
                  </code>
                  <button
                    type="button"
                    className="home-demo-card__copy"
                    aria-label={`Copy ${account.role} email`}
                    onClick={() =>
                      void handleCopy(`${account.role}-email`, account.email)
                    }
                  >
                    {copiedKey === `${account.role}-email` ? 'Copied ✓' : 'Copy email'}
                  </button>
                </div>

                <div className="home-demo-card__cred">
                  <span className="home-demo-card__label">Password</span>
                  <code className="home-demo-card__value">{account.password}</code>
                  <button
                    type="button"
                    className="home-demo-card__copy"
                    aria-label={`Copy ${account.role} password`}
                    onClick={() =>
                      void handleCopy(`${account.role}-password`, account.password)
                    }
                  >
                    {copiedKey === `${account.role}-password`
                      ? 'Copied ✓'
                      : 'Copy password'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="home-demo__actions">
            <Link className="home-btn home-btn--primary" to="/login">
              Go to Login →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
