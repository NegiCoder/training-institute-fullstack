import { useEffect, useState } from 'react'

const STORAGE_KEY = 'excelgens_demo_hint_seen'
const SHOW_DELAY_MS = 400
const AUTO_DISMISS_MS = 5000

type DemoHintToastProps = {
  onOpenDemo?: () => void
}

export function DemoHintToast({ onOpenDemo }: DemoHintToastProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      /* ignore */
    }

    setMounted(true)
    const showTimer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    const hideTimer = window.setTimeout(dismiss, SHOW_DELAY_MS + AUTO_DISMISS_MS)

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

  function handleOpenDemo() {
    onOpenDemo?.()
    dismiss()
  }

  if (!mounted) return null

  return (
    <>
      <div
        className={`demo-hint-backdrop${visible ? ' demo-hint-backdrop--show' : ''}`}
        aria-hidden="true"
      />
      <div
        className={`demo-hint-toast${visible ? ' demo-hint-toast--show' : ''}`}
        role="dialog"
        aria-live="polite"
        aria-label="How to try the live demo"
      >
        <span className="demo-hint-toast__icon" aria-hidden="true">
          🧪
        </span>
        <div className="demo-hint-toast__body">
          <p className="demo-hint-toast__title">Test the full website</p>
          <p className="demo-hint-toast__text">
            Open the <strong>Live Demo</strong> tab to copy login details for Student,
            Trainer, Admin, and Business User roles.
          </p>
          {onOpenDemo && (
            <button
              type="button"
              className="demo-hint-toast__cta"
              onClick={handleOpenDemo}
            >
              Open Live Demo tab
            </button>
          )}
        </div>
        <button
          type="button"
          className="demo-hint-toast__close"
          onClick={dismiss}
          title="Dismiss"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </>
  )
}
