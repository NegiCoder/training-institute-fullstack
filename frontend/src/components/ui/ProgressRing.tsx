/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

import { useEffect, useState } from 'react'

type ProgressRingProps = {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  label = 'Overall',
}: ProgressRingProps) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percentage))
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnimated(clamped))
    return () => window.cancelAnimationFrame(frame)
  }, [clamped])

  return (
    <div
      className="progress-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="progress-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="progress-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring__center">
        <strong>{clamped}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}
