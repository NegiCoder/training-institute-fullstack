import { useEffect, useState } from 'react'

const STORAGE_KEY = 'excelgens_coldstart_seen'
const AUTO_DISMISS_MS = 6500

export function ColdStartToast() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return
    if (localStorage.getItem(STORAGE_KEY)) return

    setMounted(true)
    const showTimer = window.setTimeout(() => setVisible(true), 500)
    const hideTimer = window.setTimeout(dismiss, AUTO_DISMISS_MS)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!mounted) return null

  return (
    <div
      className={`cold-start-toast${visible ? ' show' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span>
        <b>Server waking up.</b> After idle, the backend may take a few seconds to
        restart. Please wait — refresh once if the page seems stuck.
      </span>
      <button type="button" onClick={dismiss} title="Dismiss" aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
