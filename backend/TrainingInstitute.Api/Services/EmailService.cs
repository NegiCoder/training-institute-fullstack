using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using TrainingInstitute.Api.Configuration;

namespace TrainingInstitute.Api.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;

    public EmailService(IOptions<EmailSettings> emailOptions)
    {
        _emailSettings = emailOptions.Value;
    }

    public async Task SendCertificateEmailAsync(
        string toEmail,
        string toName,
        string courseTitle,
        string certificateNumber,
        byte[] pdfBytes)
    {
        var message = new MimeMessage();

        message.From.Add(new MailboxAddress(
            _emailSettings.FromName,
            _emailSettings.FromEmail));

        message.To.Add(new MailboxAddress(toName, toEmail));

        message.Subject = $"Your Certificate for {courseTitle}";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $"""
                <h2>Congratulations {toName}!</h2>

                <p>You have successfully completed the course:</p>

                <h3>{courseTitle}</h3>

                <p>Your certificate number is:</p>

                <strong>{certificateNumber}</strong>

                <p>Your certificate PDF is attached with this email.</p>

                <p>Regards,<br/>Training Institute</p>
                """
        };

        bodyBuilder.Attachments.Add(
            $"{certificateNumber}.pdf",
            pdfBytes,
            ContentType.Parse("application/pdf"));

        message.Body = bodyBuilder.ToMessageBody();

        using var smtpClient = new SmtpClient();

        var socketOptions = _emailSettings.UseStartTls
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.Auto;

        await smtpClient.ConnectAsync(
            _emailSettings.Host,
            _emailSettings.Port,
            socketOptions);

        await smtpClient.AuthenticateAsync(
            _emailSettings.Username,
            _emailSettings.Password);

        await smtpClient.SendAsync(message);

        await smtpClient.DisconnectAsync(true);
    }
}