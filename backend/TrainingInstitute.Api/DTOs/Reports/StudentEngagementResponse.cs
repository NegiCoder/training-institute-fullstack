/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.Reports;

public class StudentEngagementResponse
{
    public List<TopStudentResponse> TopByCertificates { get; set; } = new();

    public List<IdleStudentResponse> IdleStudents { get; set; } = new();
}

public class TopStudentResponse
{
    public int StudentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int CertificatesEarned { get; set; }

    public int CompletedCourses { get; set; }
}

public class IdleStudentResponse
{
    public int StudentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public DateTime? LastEnrollmentAt { get; set; }

    public int DaysSinceLastEnrollment { get; set; }

    public int TotalEnrollments { get; set; }
}
