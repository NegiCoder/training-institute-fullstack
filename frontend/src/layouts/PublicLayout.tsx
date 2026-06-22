/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { EXCELGENS_DOCS_URL } from '@/config/docs'
import { useAuthStore } from '@/store/authStore'
import { getDashboardPathByRole } from '@/utils/getDashboardPathByRole'

export function PublicLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
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
            <NavLink to="/" end onClick={closeNav}>
              Home
            </NavLink>
            <NavLink to="/courses" onClick={closeNav}>
              Courses
            </NavLink>
            <NavLink to="/verify" onClick={closeNav}>
              Verify
            </NavLink>
            <a
              className="site-nav-doc"
              href={EXCELGENS_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>

            {!isAuthenticated ? (
              <>
                <NavLink to="/login" onClick={closeNav}>
                  Login
                </NavLink>
                <NavLink to="/register" onClick={closeNav}>
                  Register
                </NavLink>
              </>
            ) : (
              <Link to={getDashboardPathByRole(user?.role ?? '')} onClick={closeNav}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}
