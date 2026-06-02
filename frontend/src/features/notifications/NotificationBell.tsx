import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/store/authStore'
import type { NotificationResponse } from '@/types'

const POLL_INTERVAL_MS = 60_000
const PREVIEW_LIMIT = 8

function formatRelative(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)

  if (diffSec < 60) {
    return 'just now'
  }

  const diffMin = Math.round(diffSec / 60)

  if (diffMin < 60) {
    return `${diffMin} min ago`
  }

  const diffHr = Math.round(diffMin / 60)

  if (diffHr < 24) {
    return `${diffHr} hr ago`
  }

  const diffDay = Math.round(diffHr / 24)

  if (diffDay < 7) {
    return `${diffDay} d ago`
  }

  return date.toLocaleDateString()
}

export function NotificationBell() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<NotificationResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch {
      // intentionally silent — keep the bell quiet on transient errors
    }
  }, [isAuthenticated])

  const loadPreview = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')
      const rows = await notificationService.getMine(false, PREVIEW_LIMIT)
      setItems(rows)
    } catch {
      setErrorMessage('Could not load notifications.')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    void refreshUnreadCount()
    const handle = window.setInterval(() => {
      void refreshUnreadCount()
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(handle)
  }, [isAuthenticated, refreshUnreadCount])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null

      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false)
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [isOpen])

  function togglePanel() {
    const opening = !isOpen
    setIsOpen(opening)

    if (opening) {
      void loadPreview()
    }
  }

  async function handleItemClick(item: NotificationResponse) {
    setIsOpen(false)

    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.notificationId)
        setItems((current) =>
          current.map((row) =>
            row.notificationId === item.notificationId
              ? { ...row, isRead: true, readAt: new Date().toISOString() }
              : row,
          ),
        )
        setUnreadCount((current) => Math.max(0, current - 1))
      } catch {
        // ignore — user can mark it later
      }
    }

    if (item.link) {
      navigate(item.link)
    } else {
      navigate('/notifications')
    }
  }

  async function handleMarkAllRead() {
    try {
      const updated = await notificationService.markAllRead()

      if (updated > 0) {
        setItems((current) =>
          current.map((row) => ({
            ...row,
            isRead: true,
            readAt: row.readAt ?? new Date().toISOString(),
          })),
        )
        setUnreadCount(0)
      }
    } catch {
      setErrorMessage('Could not mark all as read.')
    }
  }

  const badgeLabel = useMemo(() => {
    if (unreadCount === 0) {
      return null
    }

    if (unreadCount > 9) {
      return '9+'
    }

    return String(unreadCount)
  }, [unreadCount])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className={`notification-bell-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={togglePanel}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
      >
        <span aria-hidden="true">🔔</span>
        {badgeLabel && (
          <span className="notification-badge" aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel" role="menu">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            <button
              type="button"
              className="link-button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          {isLoading && <p className="notification-empty">Loading...</p>}

          {!isLoading && errorMessage && (
            <p className="notification-empty">{errorMessage}</p>
          )}

          {!isLoading && !errorMessage && items.length === 0 && (
            <p className="notification-empty">You're all caught up.</p>
          )}

          {!isLoading && !errorMessage && items.length > 0 && (
            <ul className="notification-list">
              {items.map((item) => (
                <li
                  key={item.notificationId}
                  className={item.isRead ? '' : 'is-unread'}
                >
                  <button
                    type="button"
                    className="notification-item-button"
                    onClick={() => void handleItemClick(item)}
                  >
                    <span className="notification-item-title">{item.title}</span>
                    <span className="notification-item-message">{item.message}</span>
                    <span className="notification-item-time">
                      {formatRelative(item.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="notification-panel-footer">
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsOpen(false)
                navigate('/notifications')
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
