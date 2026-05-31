namespace TrainingInstitute.Api.Services;

public interface IEmailService
{
    Task SendCertificateEmailAsync(
        string toEmail,
        string toName,
        string courseTitle,
        string certificateNumber,
        byte[] pdfBytes);

}