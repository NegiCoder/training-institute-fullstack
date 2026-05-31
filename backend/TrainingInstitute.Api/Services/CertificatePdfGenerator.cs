using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace TrainingInstitute.Api.Services;

public class CertificatePdfGenerator : ICertificatePdfGenerator
{
    public byte[] GenerateCertificatePdf(
        string studentName,
        string courseTitle,
        string certificateNumber,
        DateTime issuedAt)
    {
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
                        column.Spacing(25);

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
                            .PaddingTop(30)
                            .AlignCenter()
                            .Text("Training Institute")
                            .FontSize(20)
                            .Bold();
                    });
            });
        }).GeneratePdf();
    }
}