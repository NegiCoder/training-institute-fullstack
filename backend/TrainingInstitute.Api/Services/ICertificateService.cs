using TrainingInstitute.Api.DTOs.Certificates;
using TrainingInstitute.Api.DTOs.Common;

namespace TrainingInstitute.Api.Services;

public interface ICertificateService
{
    Task<CertificateResponse> IssueCertificateAsync(int adminUserId, IssueCertificateRequest request);

    Task<CertificateResponse?> GetByEnrollmentIdAsync(int courseEnrollmentId);

    Task<CertificateResponse?> GetByIdAsync(int certificateIssuedId);

    Task<List<CertificateResponse>> GetAllAsync();

    Task<List<CertificateResponse>> GetMyCertificatesAsync(int userId);

    Task<CertificateDownloadResult?> GetCertificateFileAsync(int certificateIssuedId, int userId, bool isAdmin);

    Task<PagedResponse<CertificateResponse>> SearchAsync(CertificateSearchRequest request);

    // Public verify: certificate number ke base pe minimum public info return karta hai.
    // Auth required nahi hai - recruiter/anyone yaha aake verify kar sakta hai.
    Task<CertificateVerifyResponse> VerifyAsync(string certificateNumber);
}