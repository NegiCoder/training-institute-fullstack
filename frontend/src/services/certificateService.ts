import { apiClient } from '@/services/apiClient'
import type {
  CertificateResponse,
  CertificateSearchRequest,
  IssueCertificateRequest,
  PagedResponse,
} from '@/types'

export const certificateService = {
  async issueCertificate(
    request: IssueCertificateRequest,
  ): Promise<CertificateResponse> {
    const response = await apiClient.post<CertificateResponse>(
      '/api/Certificates/issue',
      request,
    )
    return response.data
  },

  async getAll(): Promise<CertificateResponse[]> {
    const response = await apiClient.get<CertificateResponse[]>('/api/Certificates')
    return response.data
  },

  async getMyCertificates(): Promise<CertificateResponse[]> {
    const response = await apiClient.get<CertificateResponse[]>('/api/Certificates/me')
    return response.data
  },

  async search(
    request: CertificateSearchRequest,
  ): Promise<PagedResponse<CertificateResponse>> {
    const response = await apiClient.get<PagedResponse<CertificateResponse>>(
      '/api/Certificates/search',
      {
        params: request,
      },
    )
    return response.data
  },

  async downloadCertificate(certificateIssuedId: number): Promise<Blob> {
    const response = await apiClient.get(
      `/api/Certificates/download/${certificateIssuedId}`,
      {
        responseType: 'blob',
      },
    )
    return response.data
  },
}
