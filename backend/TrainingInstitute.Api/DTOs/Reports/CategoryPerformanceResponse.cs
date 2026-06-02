namespace TrainingInstitute.Api.DTOs.Reports;

public class CategoryPerformanceResponse
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public int TotalCourses { get; set; }

    public int TotalEnrollments { get; set; }

    public int CompletedEnrollments { get; set; }

    public int CertificatesIssued { get; set; }

    public decimal AverageCompletionRate { get; set; }
}
