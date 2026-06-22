/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.Certificates;

public class CertificateSearchRequest
{
    public string? SearchTerm { get; set; }

    public int? CourseEnrollmentId { get; set; }

    public int? StudentId { get; set; }

    public int? CourseId { get; set; }

    public CertificateEmailStatus? EmailStatus { get; set; }

    public DateTime? IssuedFrom { get; set; }

    public DateTime? IssuedTo { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}