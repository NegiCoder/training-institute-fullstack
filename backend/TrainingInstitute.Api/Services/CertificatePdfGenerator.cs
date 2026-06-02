using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace TrainingInstitute.Api.Services;

public class CertificatePdfGenerator : ICertificatePdfGenerator
{
    private const string OrganizationName = "ExcelGens";

    // Cached so we read the logo file from disk only once per process lifetime
    private static readonly Lazy<byte[]?> LogoBytes = new(LoadLogo);

    public byte[] GenerateCertificatePdf(
        string studentName,
        string courseTitle,
        string certificateNumber,
        DateTime issuedAt)
    {
        var logo = LogoBytes.Value;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(28);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(14).FontColor(Colors.Grey.Darken4));

                page.Content()
                    .Border(2)
                    .BorderColor(Colors.Blue.Darken3)
                    .Padding(6)
                    .Border(1)
                    .BorderColor(Colors.Yellow.Darken2)
                    .Padding(24)
                    .Column(column =>
                    {
                        column.Spacing(12);

                        column.Item()
                            .AlignCenter()
                            .Element(header =>
                            {
                                if (logo != null)
                                {
                                    header.Width(78)
                                        .Height(78)
                                        .Image(logo)
                                        .FitArea();
                                }
                                else
                                {
                                    header.Text(OrganizationName)
                                        .FontSize(26)
                                        .Bold()
                                        .FontColor(Colors.Blue.Darken2);
                                }
                            });

                        column.Item()
                            .AlignCenter()
                            .Text("Professional Learning · Verified Certificate")
                            .FontSize(11)
                            .FontColor(Colors.Grey.Darken1);

                        column.Item()
                            .PaddingVertical(2)
                            .LineHorizontal(1)
                            .LineColor(Colors.Yellow.Darken2);

                        column.Item()
                            .AlignCenter()
                            .Text("Certificate of Completion")
                            .FontSize(34)
                            .Bold()
                            .FontColor(Colors.Blue.Darken3);

                        column.Item()
                            .AlignCenter()
                            .Text("This certificate is proudly presented to")
                            .FontSize(15)
                            .Italic()
                            .FontColor(Colors.Grey.Darken2);

                        column.Item()
                            .AlignCenter()
                            .Text(studentName)
                            .FontSize(31)
                            .Bold()
                            .FontColor(Colors.Black);

                        column.Item()
                            .AlignCenter()
                            .Width(280)
                            .LineHorizontal(1)
                            .LineColor(Colors.Grey.Lighten1);

                        column.Item()
                            .AlignCenter()
                            .Text("for successfully completing the course")
                            .FontSize(15)
                            .Italic()
                            .FontColor(Colors.Grey.Darken2);

                        column.Item()
                            .AlignCenter()
                            .Text(courseTitle)
                            .FontSize(24)
                            .SemiBold()
                            .FontColor(Colors.Green.Darken2);

                        column.Item()
                            .PaddingTop(10)
                            .LineHorizontal(1)
                            .LineColor(Colors.Yellow.Darken2);

                        column.Item()
                            .PaddingTop(4)
                            .Row(row =>
                        {
                            row.RelativeItem()
                                .Column(left =>
                                {
                                    left.Item()
                                        .Text("Certificate Number")
                                        .FontSize(11)
                                        .SemiBold()
                                        .FontColor(Colors.Grey.Darken2);
                                    left.Item()
                                        .Text(certificateNumber)
                                        .FontSize(12)
                                        .FontColor(Colors.Black);
                                });

                            row.RelativeItem()
                                .AlignRight()
                                .Column(right =>
                                {
                                    right.Item()
                                        .Text("Issued Date")
                                        .FontSize(11)
                                        .SemiBold()
                                        .FontColor(Colors.Grey.Darken2);
                                    right.Item()
                                        .Text(issuedAt.ToString("dd MMM yyyy"))
                                        .FontSize(12)
                                        .FontColor(Colors.Black);
                                });
                        });

                        column.Item()
                            .PaddingTop(8)
                            .AlignCenter()
                            .Text($"Issued by {OrganizationName}")
                            .FontSize(13)
                            .Italic()
                            .FontColor(Colors.Grey.Darken2);
                    });
            });
        }).GeneratePdf();
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
