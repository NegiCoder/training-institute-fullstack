namespace TrainingInstitute.Api.DTOs.Reports;

public class ReportsOverviewResponse
{
    public int TotalStudents { get; set; }

    public int TotalTrainers { get; set; }

    public int TotalCourses { get; set; }

    public int PublishedCourses { get; set; }

    public int DraftCourses { get; set; }

    public int TotalEnrollments { get; set; }

    public int ActiveEnrollments { get; set; }

    public int CompletedEnrollments { get; set; }

    public int TotalCertificates { get; set; }

    public decimal OverallCompletionRate { get; set; }
}
