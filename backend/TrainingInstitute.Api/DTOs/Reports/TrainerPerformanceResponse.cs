/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.Reports;

public class TrainerPerformanceResponse
{
    public int TrainerId { get; set; }

    public string TrainerName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int CoursesAssigned { get; set; }

    public int TotalStudents { get; set; }

    public int CompletedStudents { get; set; }

    public int CertificatesIssued { get; set; }

    public decimal AverageCompletionRate { get; set; }
}
