namespace TrainingInstitute.Api.Services;

public interface ICertificatePdfGenerator
{
    byte[] GenerateCertificatePdf(
        string studentName,
        string courseTitle,
        string certificateNumber,
        DateTime issuedAt);
}