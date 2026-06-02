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
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(18));

                page.Content()
                    .Border(4)
                    .BorderColor(Colors.Blue.Medium)
                    .Padding(40)
                    .Column(column =>
                    {
                        column.Spacing(20);

                        // Header: logo + org name
                        column.Item().Row(headerRow =>
                        {
                            if (logo != null)
                            {
                                headerRow.AutoItem()
                                    .Width(70)
                                    .Height(70)
                                    .Image(logo)
                                    .FitArea();

                                headerRow.ConstantItem(15);
                            }

                            headerRow.RelativeItem()
                                .AlignMiddle()
                                .Text(OrganizationName)
                                .FontSize(28)
                                .Bold()
                                .FontColor(Colors.Blue.Darken2);
                        });

                        column.Item()
                            .AlignCenter()
                            .Text("Certificate of Completion")
                            .FontSize(36)
                            .Bold()
                            .FontColor(Colors.Blue.Darken2);

                        column.Item()
                            .AlignCenter()
                            .Text("This certificate is proudly presented to")
                            .FontSize(18);

                        column.Item()
                            .AlignCenter()
                            .Text(studentName)
                            .FontSize(32)
                            .Bold()
                            .FontColor(Colors.Black);

                        column.Item()
                            .AlignCenter()
                            .Text("for successfully completing the course")
                            .FontSize(18);

                        column.Item()
                            .AlignCenter()
                            .Text(courseTitle)
                            .FontSize(28)
                            .SemiBold()
                            .FontColor(Colors.Green.Darken2);

                        column.Item()
                            .PaddingTop(20)
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .Column(left =>
                                    {
                                        left.Item().Text("Certificate Number").FontSize(14).SemiBold();
                                        left.Item().Text(certificateNumber).FontSize(14);
                                    });

                                row.RelativeItem()
                                    .AlignRight()
                                    .Column(right =>
                                    {
                                        right.Item().Text("Issued Date").FontSize(14).SemiBold();
                                        right.Item().Text(issuedAt.ToString("dd MMM yyyy")).FontSize(14);
                                    });
                            });

                        column.Item()
                            .PaddingTop(20)
                            .AlignCenter()
                            .Text($"Issued by {OrganizationName}")
                            .FontSize(16)
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
