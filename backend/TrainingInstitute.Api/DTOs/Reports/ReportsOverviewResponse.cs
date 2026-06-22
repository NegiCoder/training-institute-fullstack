/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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
