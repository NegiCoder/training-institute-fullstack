/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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