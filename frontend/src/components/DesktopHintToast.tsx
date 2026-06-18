import { useEffect, useState } from 'react'

const STORAGE_KEY = 'excelgens_desktop_hint_seen'
const AUTO_DISMISS_MS = 6500

function isNonDesktopViewport(): boolean {
  const ua = navigator.userAgent || ''
  const mobileUa =
    /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini|Mobile/i.test(ua)
  const narrow = window.matchMedia('(max-width: 1024px)').matches
  return mobileUa || narrow
}

export function DesktopHintToast() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isNonDesktopViewport()) return
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      /* ignore */
    }

    setMounted(true)
    const showTimer = window.setTimeout(() => setVisible(true), 400)
    const hideTimer = window.setTimeout(dismiss, AUTO_DISMISS_MS)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!mounted) return null

  return (
    <div
      className={`desktop-hint-toast${visible ? ' show' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="desktop-hint-icon" aria-hidden="true">
        🖥️
      </span>
      <span>
        <b>Best on laptop or desktop.</b> For the best preview, please open this site on
        a computer.
      </span>
      <button type="button" onClick={dismiss} title="Dismiss" aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
