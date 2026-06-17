import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { EXCELGENS_DOCS_URL } from '@/config/docs'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { useAuthStore } from '@/store/authStore'

export function PublicLayout() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 960) {
        setNavOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function closeNav() {
    setNavOpen(false)
  }

  return (
    <div className="public-layout">
      <header className="site-header">
        <div className="site-header-bar">
          <Link className="brand" to="/" onClick={closeNav}>
            <img src="/excelgens-logo.jpeg" alt="" className="brand-logo" />
            <span>ExcelGens</span>
          </Link>

          <button
            type="button"
            className="site-nav-toggle"
            aria-expanded={navOpen}
            aria-controls="site-nav-panel"
            onClick={() => setNavOpen((current) => !current)}
          >
            {navOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        <div
          id="site-nav-panel"
          className={`site-nav-panel${navOpen ? ' is-open' : ''}`}
        >
          <nav className="site-nav-primary" aria-label="Main navigation">
          <NavLink to="/" onClick={closeNav}>
            Home
          </NavLink>
          <NavLink to="/courses" onClick={closeNav}>
            Courses
          </NavLink>
          {/* Public verify link - har user role ke liye visible (login optional) */}
          <NavLink to="/verify" onClick={closeNav}>
            Verify
          </NavLink>
          {isAuthenticated && (
            <a
              className="site-nav-doc"
              href={EXCELGENS_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          )}

          {isAuthenticated && user ? (
            <>
              {user.role === 'Admin' && (
                <>
                  <NavLink to="/admin" onClick={closeNav}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/reports" onClick={closeNav}>
                    Reports
                  </NavLink>
                  <AdminManageMenu onNavigate={closeNav} />
                </>
              )}

              {user.role === 'Student' && (
                <>
                  <NavLink to="/student" onClick={closeNav}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/student/profile" onClick={closeNav}>
                    Profile
                  </NavLink>
                  <NavLink to="/student/enrollments" onClick={closeNav}>
                    My Courses
                  </NavLink>
                  <NavLink to="/student/certificates" onClick={closeNav}>
                    Certificates
                  </NavLink>
                </>
              )}

              {user.role === 'Trainer' && (
                <>
                  <NavLink to="/trainer" onClick={closeNav}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/trainer/courses" onClick={closeNav}>
                    My Courses
                  </NavLink>
                  <NavLink to="/trainer/modules" onClick={closeNav}>
                    Manage Content
                  </NavLink>
                  <NavLink to="/trainer/students" onClick={closeNav}>
                    My Students
                  </NavLink>
                </>
              )}

              {/* BusinessUser ko sirf reports dikhte hai, baaki kuch nahi */}
              {user.role === 'BusinessUser' && (
                <NavLink to="/reports" onClick={closeNav}>
                  Reports
                </NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeNav}>
                Login
              </NavLink>
              <NavLink to="/register" onClick={closeNav}>
                Register
              </NavLink>
              <a
                className="site-nav-doc"
                href={EXCELGENS_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
            </>
          )}
          </nav>

          {isAuthenticated && user && (
            <div className="site-nav-actions">
              <NotificationBell />
              <span className="user-pill" title={`${user.fullName} (${user.role})`}>
                {user.fullName} ({user.role})
              </span>
              <button className="nav-button" type="button" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}

function AdminManageMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null

      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false)
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [open])

  function closeMenu() {
    setOpen(false)
    onNavigate?.()
  }

  return (
    <div className="nav-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`nav-dropdown-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Manage <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="nav-dropdown-menu" role="menu">
          <NavLink to="/admin/course-categories" onClick={closeMenu}>
            Categories
          </NavLink>
          <NavLink to="/admin/courses" onClick={closeMenu}>
            Courses
          </NavLink>
          <NavLink to="/admin/course-pricing" onClick={closeMenu}>
            Pricing
          </NavLink>
          <NavLink to="/admin/course-trainers" onClick={closeMenu}>
            Assign Trainers
          </NavLink>
          <NavLink to="/admin/students" onClick={closeMenu}>
            Students
          </NavLink>
          <NavLink to="/admin/enrollments" onClick={closeMenu}>
            Enrollments
          </NavLink>
          <NavLink to="/admin/certificates" onClick={closeMenu}>
            Certificates
          </NavLink>
          <div className="nav-dropdown-divider" />
          <NavLink to="/admin/create-trainer" onClick={closeMenu}>
            Create Trainer
          </NavLink>
          <NavLink to="/admin/create-admin" onClick={closeMenu}>
            Create Admin
          </NavLink>
          <NavLink to="/admin/create-business-user" onClick={closeMenu}>
            Create Business User
          </NavLink>
        </div>
      )}
    </div>
  )
}
