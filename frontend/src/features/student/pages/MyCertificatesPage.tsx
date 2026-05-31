import { useEffect, useState } from 'react'
import { certificateService } from '@/services/certificateService'
import type { CertificateResponse } from '@/types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadCertificates() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const result = await certificateService.getMyCertificates()
        setCertificates(result)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadCertificates()
  }, [])

  async function handleDownload(certificate: CertificateResponse) {
    setDownloadingId(certificate.certificateIssuedId)
    setErrorMessage('')

    try {
      const fileBlob = await certificateService.downloadCertificate(
        certificate.certificateIssuedId,
      )
      const fileUrl = URL.createObjectURL(fileBlob)
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = `${certificate.certificateNumber}.pdf`
      link.click()
      URL.revokeObjectURL(fileUrl)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Student</p>
      <h1>My Certificates</h1>
      <p className="page-text">
        Download certificates issued for your completed course enrollments.
      </p>

      {isLoading && <p className="page-text">Loading certificates...</p>}

      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {!isLoading && !errorMessage && certificates.length === 0 && (
        <div className="empty-state">No certificates have been issued yet.</div>
      )}

      {!isLoading && !errorMessage && certificates.length > 0 && (
        <div className="certificate-grid">
          {certificates.map((certificate) => (
            <article className="certificate-card" key={certificate.certificateIssuedId}>
              <div>
                <span className="status-label">Certificate</span>
                <h2>{certificate.courseTitle}</h2>
                <p>{certificate.certificateNumber}</p>
                <p>Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
              </div>

              <button
                className="primary-button"
                type="button"
                disabled={downloadingId === certificate.certificateIssuedId}
                onClick={() => handleDownload(certificate)}
              >
                {downloadingId === certificate.certificateIssuedId
                  ? 'Downloading...'
                  : 'Download PDF'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
