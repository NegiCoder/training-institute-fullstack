using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.Certificates;

public class CertificateResponse
{
    public int CertificateIssuedId { get; set; }
    public int CourseEnrollmentId { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public string PdfPath { get; set; } = string.Empty;
    public CertificateEmailStatus EmailStatus { get; set; }
    public DateTime? EmailSentAt { get; set; }
    public DateTime CreatedAt { get; set; }
}