/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.StudentModuleProgress;

public class StudentModuleProgressResponse
{
    public int StudentModuleProgressId { get; set; }

    public int CourseEnrollmentId { get; set; }

    public int CourseContentId { get; set; }

    public string ModuleName { get; set; } = string.Empty;

    public DateTime CompletedAt { get; set; }

    public int ProgressPercentage { get; set; }
}