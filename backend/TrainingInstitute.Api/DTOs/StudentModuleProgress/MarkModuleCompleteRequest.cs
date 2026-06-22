/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.StudentModuleProgress;

public class MarkModuleCompleteRequest
{
    public int CourseEnrollmentId { get; set; }
    public int CourseContentId { get; set; }
}