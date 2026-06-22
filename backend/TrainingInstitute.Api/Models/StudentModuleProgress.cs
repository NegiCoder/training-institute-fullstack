/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Models;

// ek row = is enrollment ne ye module finish kiya
// (CourseEnrollmentId + CourseContentId) unique - double click se duplicate na ho
public class StudentModuleProgress
{
    public int StudentModuleProgressId { get; set; }

    public int CourseEnrollmentId { get; set; }

    public CourseEnrollment? Enrollment { get; set; }

    public int CourseContentId { get; set; }

    public CourseContent? Content { get; set; }

    public DateTime CompletedAt { get; set; }
}
