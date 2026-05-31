import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function PublicLayout() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="public-layout">
      <header className="site-header">
        <Link className="brand" to="/">
          Training Institute
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          {isAuthenticated && user ? (
            <>
              {user.role === 'Admin' && (
                <>
                  <NavLink to="/admin">Dashboard</NavLink>
                  <NavLink to="/admin/course-categories">Categories</NavLink>
                  <NavLink to="/admin/courses">Courses</NavLink>
                  <NavLink to="/admin/course-pricing">Pricing</NavLink>
                  <NavLink to="/admin/course-trainers">Trainers</NavLink>
                  <NavLink to="/admin/create-trainer">Create Trainer</NavLink>
                  <NavLink to="/admin/create-admin">Create Admin</NavLink>
                  <NavLink to="/admin/students">Students</NavLink>
                  <NavLink to="/admin/enrollments">Enrollments</NavLink>
                  <NavLink to="/admin/certificates">Certificates</NavLink>
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
              <span className="user-pill">
                {user.fullName} ({user.role})
              </span>
              <button className="nav-button" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}
