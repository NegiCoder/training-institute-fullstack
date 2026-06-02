namespace TrainingInstitute.Api.DTOs.Reports;

public class CoursePerformanceResponse
{
    public int CourseId { get; set; }

    public string CourseTitle { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public bool IsFree { get; set; }

    public decimal? CurrentPrice { get; set; }

    public int TotalEnrollments { get; set; }

    public int AssignedCount { get; set; }

    public int InProgressCount { get; set; }

    public int CompletedCount { get; set; }

    public int CancelledCount { get; set; }

    public int CertificatesIssued { get; set; }

    public decimal CompletionRate { get; set; }

    public decimal CertificateRate { get; set; }

    public decimal AverageProgressPercentage { get; set; }
}
