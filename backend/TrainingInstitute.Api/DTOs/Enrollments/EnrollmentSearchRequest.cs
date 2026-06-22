/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.Enrollments;

public class EnrollmentSearchRequest
{
    public string? SearchTerm { get; set; }

    public int? StudentId { get; set; }

    public int? CourseId { get; set; }

    public EnrollmentStatus? Status { get; set; }

    public DateTime? StartDateFrom { get; set; }

    public DateTime? StartDateTo { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}