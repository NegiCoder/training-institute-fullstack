/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { EXCELGENS_DOCS_URL } from '@/config/docs'
import {
  getDashboardHomePath,
  getDashboardNav,
  getRoleLabel,
} from '@/config/dashboardNav'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { useAuthStore } from '@/store/authStore'

export function DashboardLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navSections = user ? getDashboardNav(user.role) : []
  const homePath = user ? getDashboardHomePath(user.role) : '/'

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dashboard-nav-open', mobileOpen)
    return () => document.body.classList.remove('dashboard-nav-open')
  }, [mobileOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    navigate(q ? `/courses?search=${encodeURIComponent(q)}` : '/courses')
    setMobileOpen(false)
  }

  function closeMobile() {
    setMobileOpen(false)
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <div
      className={`dashboard-layout${sidebarCollapsed ? ' dashboard-layout--collapsed' : ''}${mobileOpen ? ' dashboard-layout--mobile-open' : ''}`}
    >
      {mobileOpen && (
        <button
          type="button"
          className="dashboard-overlay"
          aria-label="Close navigation menu"
          onClick={closeMobile}
        />
      )}

      <aside
        className="dashboard-sidebar"
        id="dashboard-sidebar"
        aria-label="Dashboard navigation"
      >
        <button
          type="button"
          className="dashboard-sidebar__toggle"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          onClick={() => setSidebarCollapsed((c) => !c)}
        >
          <span className="dashboard-sidebar__toggle-icon" aria-hidden="true">
            {sidebarCollapsed ? '›' : '‹'}
          </span>
        </button>

        <div className="dashboard-sidebar__head">
          <Link
            className="dashboard-sidebar__brand"
            to={homePath}
            onClick={closeMobile}
          >
            <img
              src="/excelgens-logo.jpeg"
              alt=""
              className="dashboard-sidebar__logo"
            />
            <span className="dashboard-sidebar__brand-text">ExcelGens</span>
          </Link>
        </div>

        {user && (
          <p className="dashboard-sidebar__role">
            <span className="dashboard-sidebar__role-label">
              {getRoleLabel(user.role)}
            </span>
          </p>
        )}

        <nav className="dashboard-sidebar__nav">
          {navSections.map((section, sectionIndex) => (
            <div
              className="dashboard-sidebar__section"
              key={section.title ?? `section-${sectionIndex}`}
            >
              {section.title && (
                <p className="dashboard-sidebar__section-title">{section.title}</p>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `dashboard-sidebar__link${isActive ? ' dashboard-sidebar__link--active' : ''}`
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={closeMobile}
                >
                  <span className="dashboard-sidebar__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="dashboard-sidebar__text">{item.label}</span>
                  {sidebarCollapsed && (
                    <span className="dashboard-sidebar__tooltip" role="tooltip">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="dashboard-sidebar__foot">
          <a
            className="dashboard-sidebar__link"
            href={EXCELGENS_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={sidebarCollapsed ? 'Documentation' : undefined}
          >
            <span className="dashboard-sidebar__icon" aria-hidden="true">
              📖
            </span>
            <span className="dashboard-sidebar__text">Documentation</span>
          </a>
          <button
            type="button"
            className="dashboard-sidebar__link dashboard-sidebar__link--logout"
            onClick={logout}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <span className="dashboard-sidebar__icon" aria-hidden="true">
              🚪
            </span>
            <span className="dashboard-sidebar__text">Logout</span>
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-topbar__menu"
            aria-expanded={mobileOpen}
            aria-controls="dashboard-sidebar"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            ☰
          </button>

          <form
            className="dashboard-topbar__search"
            onSubmit={handleSearch}
            role="search"
          >
            <label className="visually-hidden" htmlFor="dashboard-search">
              Search courses
            </label>
            <input
              id="dashboard-search"
              type="search"
              placeholder="Search courses…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" aria-label="Search">
              🔍
            </button>
          </form>

          <div className="dashboard-topbar__actions">
            <NotificationBell />
            {user && (
              <div
                className="dashboard-topbar__profile"
                title={`${user.fullName} (${user.role})`}
              >
                <span className="dashboard-topbar__avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="dashboard-topbar__name">{user.fullName}</span>
              </div>
            )}
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
