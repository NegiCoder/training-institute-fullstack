/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.Students;

public class StudentSearchRequest
{
    public string? SearchTerm { get; set; }

    public string? City { get; set; }

    public string? CollegeName { get; set; }

    public int? PassoutYear { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}