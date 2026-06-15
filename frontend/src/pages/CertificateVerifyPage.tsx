import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { certificateService } from '@/services/certificateService'
import type { CertificateVerifyResponse } from '@/types'

// Public verify page - login ki zarurat nahi.
// Do tarah se reach kar sakte hai:
//   1) /verify -> user manually number daalega
//   2) /verify/:certNumber -> QR scan ya direct link (auto fetch on mount)
export function CertificateVerifyPage() {
  const navigate = useNavigate()
  const { certNumber } = useParams<{ certNumber?: string }>()

  const [input, setInput] = useState(certNumber ?? '')
  const [result, setResult] = useState<CertificateVerifyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // URL me certificate number aaya hai - turant verify trigger karte hai
    if (certNumber && certNumber.trim().length > 0) {
      void runVerify(certNumber.trim())
    }
  }, [certNumber])

  async function runVerify(value: string) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await certificateService.verify(value)
      setResult(response)
    } catch {
      // Network / 5xx jaise unexpected case - generic message dikha do
      setError('Verify request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) {
      setError('Please enter a certificate number.')
      return
    }
    // URL bhi update kar dete hai taaki user copy/share kar sake
    navigate(`/verify/${encodeURIComponent(trimmed)}`)
    void runVerify(trimmed)
  }

  function formatDate(iso?: string | null) {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return iso
    }
  }

  return (
    <section className="page-card verify-card">
      <p className="eyebrow">Certificate Verification</p>
      <h1>Verify an ExcelGens Certificate</h1>
      <p className="page-text">
        Enter the certificate number printed on the PDF (or scan the QR code) to confirm
        that this certificate was issued by ExcelGens.
      </p>

      <form className="verify-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="verify-input"
          placeholder="e.g. EG-2026-000123"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Certificate number"
        />
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      {error && <div className="verify-message verify-error">{error}</div>}

      {result && result.isValid && (
        <div className="verify-result verify-result-success">
          <div className="verify-result-header">
            <span className="verify-badge verify-badge-success">VERIFIED</span>
            <span className="verify-subtle">
              Issued by {result.issuedBy ?? 'ExcelGens'}
            </span>
          </div>

          <dl className="verify-grid">
            <div>
              <dt>Certificate Number</dt>
              <dd>{result.certificateNumber}</dd>
            </div>
            <div>
              <dt>Student</dt>
              <dd>{result.studentName ?? '—'}</dd>
            </div>
            <div>
              <dt>Course</dt>
              <dd>{result.courseTitle ?? '—'}</dd>
            </div>
            <div>
              <dt>Issued On</dt>
              <dd>{formatDate(result.issuedAt)}</dd>
            </div>
          </dl>

          <p className="verify-footnote">
            This certificate is authentic and was issued by ExcelGens. For any
            additional questions, please contact the institute directly.
          </p>
        </div>
      )}

      {result && !result.isValid && (
        <div className="verify-result verify-result-invalid">
          <span className="verify-badge verify-badge-invalid">NOT FOUND</span>
          <p className="verify-message">
            We could not find a certificate with the number{' '}
            <strong>{result.certificateNumber || input}</strong>. Please double check
            the number for typos and try again.
          </p>
        </div>
      )}
    </section>
  )
}
