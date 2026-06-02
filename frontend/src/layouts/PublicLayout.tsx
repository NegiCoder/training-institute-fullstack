import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { useAuthStore } from '@/store/authStore'

export function PublicLayout() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="public-layout">
      <header className="site-header">
        <Link className="brand" to="/">
          <img src="/excelgens-logo.jpeg" alt="" className="brand-logo" />
          <span>ExcelGens</span>
        </Link>

        <nav className="site-nav-primary" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/courses">Courses</NavLink>

          {isAuthenticated && user ? (
            <>
              {user.role === 'Admin' && (
                <>
                  <NavLink to="/admin">Dashboard</NavLink>
                  <NavLink to="/admin/reports">Reports</NavLink>
                  <AdminManageMenu />
                </>
              )}

              {user.role === 'Student' && (
                <>
                  <NavLink to="/student">Dashboard</NavLink>
                  <NavLink to="/student/profile">Profile</NavLink>
                  <NavLink to="/student/enrollments">My Courses</NavLink>
                  <NavLink to="/student/certificates">Certificates</NavLink>
                </>
              )}

              {user.role === 'Trainer' && (
                <>
                  <NavLink to="/trainer">Dashboard</NavLink>
                  <NavLink to="/trainer/courses">My Courses</NavLink>
                  <NavLink to="/trainer/modules">Manage Content</NavLink>
                  <NavLink to="/trainer/students">My Students</NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
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
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}

function AdminManageMenu() {
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
        </div>
      )}
    </div>
  )
}
