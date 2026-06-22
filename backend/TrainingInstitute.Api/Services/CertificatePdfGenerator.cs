/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using Microsoft.Extensions.Options;
using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TrainingInstitute.Api.Configuration;

namespace TrainingInstitute.Api.Services;

public class CertificatePdfGenerator : ICertificatePdfGenerator
{
    private const string OrganizationName = "ExcelGens";

    // Logo ek baar disk se padh ke memory me cache kar liya - har certificate
    // ke liye fir-fir IO nahi karna padta.
    private static readonly Lazy<byte[]?> LogoBytes = new(LoadLogo);

    private readonly CertificateVerifySettings _verifySettings;

    public CertificatePdfGenerator(IOptions<CertificateVerifySettings> verifyOptions)
    {
        _verifySettings = verifyOptions.Value;
    }

    public byte[] GenerateCertificatePdf(
        string studentName,
        string courseTitle,
        string certificateNumber,
        DateTime issuedAt)
    {
        var logo = LogoBytes.Value;

        // QR code generate karte hai jisme verify page ka full URL ho.
        // Recruiter QR scan karega -> frontend verify page khulega -> backend hit hoga.
        var qrCode = BuildVerifyQrCode(certificateNumber);

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(22);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(13).FontColor(Colors.Grey.Darken4));

                // IMPORTANT: sab content ek hi page me fit hona chahiye.
                // Pehle QR + bade fonts ke karan content page 2 par chala jaata tha.
                // Isliye fonts/spacing/padding thode compact kar diye hai.
                page.Content()
                    .Border(2)
                    .BorderColor(Colors.Blue.Darken3)
                    .Padding(4)
                    .Border(1)
                    .BorderColor(Colors.Yellow.Darken2)
                    .Padding(16)
                    .Column(column =>
                    {
                        column.Spacing(7);

                        // Header: sirf logo dikhate hai. Logo ke saath wapas
                        // "ExcelGens" likhna messy lagta tha, isliye hata diya.
                        column.Item()
                            .AlignCenter()
                            .Element(header =>
                            {
                                if (logo != null)
                                {
                                    header.Width(60)
                                        .Height(60)
                                        .Image(logo)
                                        .FitArea();
                                }
                                else
                                {
                                    // Logo missing case - text fallback rakha hai
                                    header.Text(OrganizationName)
                                        .FontSize(24)
                                        .Bold()
                                        .FontColor(Colors.Blue.Darken2);
                                }
                            });

                        column.Item()
                            .AlignCenter()
                            .Text("Professional Learning · Verified Certificate")
                            .FontSize(10)
                            .FontColor(Colors.Grey.Darken1);

                        column.Item()
                            .PaddingVertical(1)
                            .LineHorizontal(1)
                            .LineColor(Colors.Yellow.Darken2);

                        column.Item()
                            .AlignCenter()
                            .Text("Certificate of Completion")
                            .FontSize(28)
                            .Bold()
                            .FontColor(Colors.Blue.Darken3);

                        column.Item()
                            .AlignCenter()
                            .Text("This certificate is proudly presented to")
                            .FontSize(13)
                            .Italic()
                            .FontColor(Colors.Grey.Darken2);

                        column.Item()
                            .AlignCenter()
                            .Text(studentName)
                            .FontSize(26)
                            .Bold()
                            .FontColor(Colors.Black);

                        column.Item()
                            .AlignCenter()
                            .Width(260)
                            .LineHorizontal(1)
                            .LineColor(Colors.Grey.Lighten1);

                        column.Item()
                            .AlignCenter()
                            .Text("for successfully completing the course")
                            .FontSize(13)
                            .Italic()
                            .FontColor(Colors.Grey.Darken2);

                        column.Item()
                            .AlignCenter()
                            .Text(courseTitle)
                            .FontSize(20)
                            .SemiBold()
                            .FontColor(Colors.Green.Darken2);

                        column.Item()
                            .PaddingTop(6)
                            .LineHorizontal(1)
                            .LineColor(Colors.Yellow.Darken2);

                        // Footer ka pehla row: bayi taraf cert number+date, dayi taraf QR code.
                        column.Item()
                            .PaddingTop(2)
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .Column(left =>
                                    {
                                        left.Item()
                                            .Text("Certificate Number")
                                            .FontSize(10)
                                            .SemiBold()
                                            .FontColor(Colors.Grey.Darken2);
                                        left.Item()
                                            .Text(certificateNumber)
                                            .FontSize(11)
                                            .FontColor(Colors.Black);

                                        left.Item()
                                            .PaddingTop(6)
                                            .Text("Issued Date")
                                            .FontSize(10)
                                            .SemiBold()
                                            .FontColor(Colors.Grey.Darken2);
                                        left.Item()
                                            .Text(issuedAt.ToString("dd MMM yyyy"))
                                            .FontSize(11)
                                            .FontColor(Colors.Black);
                                    });

                                // QR right side me - sirf tabhi dikhate hai jab
                                // verify URL configured ho.
                                if (qrCode != null)
                                {
                                    row.ConstantItem(84)
                                        .Column(right =>
                                        {
                                            right.Item()
                                                .Width(72)
                                                .Height(72)
                                                .Image(qrCode);

                                            right.Item()
                                                .AlignCenter()
                                                .Text("Scan to verify")
                                                .FontSize(8)
                                                .FontColor(Colors.Grey.Darken1);
                                        });
                                }
                            });

                        column.Item()
                            .PaddingTop(4)
                            .AlignCenter()
                            .Text($"Issued by {OrganizationName}")
                            .FontSize(12)
                            .Italic()
                            .FontColor(Colors.Grey.Darken2);
                    });
            });
        }).GeneratePdf();
    }

    // QR code ko PNG bytes me convert karte hai.
    // Agar verify URL configured nahi hai to QR skip ho jata hai (PDF still works).
    private byte[]? BuildVerifyQrCode(string certificateNumber)
    {
        var baseUrl = _verifySettings.FrontendBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return null;
        }

        var verifyUrl = $"{baseUrl}/verify/{certificateNumber}";

        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(verifyUrl, QRCodeGenerator.ECCLevel.Q);
        using var pngQr = new PngByteQRCode(data);

        // 8 = pixel size per QR module. ~200x200 size aata hai jo crisp dikhta hai.
        return pngQr.GetGraphic(8);
    }

    private static byte[]? LoadLogo()
    {
        // wwwroot/excelgens-logo.jpeg gets shipped inside the container image.
        // Returning null is safe - the PDF will render without the logo.
        var logoPath = Path.Combine(
            AppContext.BaseDirectory,
            "wwwroot",
            "excelgens-logo.jpeg");

        return File.Exists(logoPath) ? File.ReadAllBytes(logoPath) : null;
    }
}
