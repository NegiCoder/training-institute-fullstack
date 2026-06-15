import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '@/services/notificationService'
import type { NotificationResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export function NotificationsPage() {
  const navigate = useNavigate()

  const [items, setItems] = useState<NotificationResponse[]>([])
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadItems = useCallback(async (unreadOnly: boolean) => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const rows = await notificationService.getMine(unreadOnly, 50)
      setItems(rows)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadItems(showUnreadOnly)
  }, [showUnreadOnly, loadItems])

  async function handleMarkOne(notificationId: number) {
    try {
      await notificationService.markAsRead(notificationId)
      setItems((current) =>
        current.map((row) =>
          row.notificationId === notificationId
            ? { ...row, isRead: true, readAt: new Date().toISOString() }
            : row,
        ),
      )
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleMarkAll() {
    try {
      await notificationService.markAllRead()
      setItems((current) =>
        current.map((row) => ({
          ...row,
          isRead: true,
          readAt: row.readAt ?? new Date().toISOString(),
        })),
      )
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  function handleOpenLink(item: NotificationResponse) {
    if (!item.isRead) {
      void handleMarkOne(item.notificationId)
    }

    if (item.link) {
      navigate(item.link)
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Notifications</p>
      <h1>Your activity feed</h1>
      <p className="page-text">
        Updates about course completions, certificates issued, and other actions across
        your role.
      </p>

      <div className="report-section-header notifications-toolbar">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(event) => setShowUnreadOnly(event.target.checked)}
          />
          <span>Show unread only</span>
        </label>
        <button
          className="secondary-button"
          type="button"
          onClick={handleMarkAll}
          disabled={!items.some((row) => !row.isRead)}
        >
          Mark all as read
        </button>
      </div>

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {isLoading && <p className="page-text">Loading notifications...</p>}

      {!isLoading && !errorMessage && items.length === 0 && (
        <div className="empty-state">
          {showUnreadOnly
            ? 'No unread notifications.'
            : 'No notifications yet — completing courses or issuing certificates will show up here.'}
        </div>
      )}

      {!isLoading && !errorMessage && items.length > 0 && (
        <ul className="notification-feed">
          {items.map((item) => (
            <li
              key={item.notificationId}
              className={
                item.isRead ? 'notification-row' : 'notification-row is-unread'
              }
            >
              <div className="notification-row-body">
                <div className="notification-row-title">
                  <strong>{item.title}</strong>
                  {!item.isRead && <span className="chip status-published">New</span>}
                </div>
                <p>{item.message}</p>
                <span className="muted small-text">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              <div className="notification-row-actions">
                {item.link && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleOpenLink(item)}
                  >
                    Open
                  </button>
                )}
                {!item.isRead && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => void handleMarkOne(item.notificationId)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
