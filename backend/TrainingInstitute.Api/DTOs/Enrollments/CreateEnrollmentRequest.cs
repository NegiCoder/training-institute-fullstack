/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.Enrollments;

public class CreateEnrollmentRequest
{
    public int CourseId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
}