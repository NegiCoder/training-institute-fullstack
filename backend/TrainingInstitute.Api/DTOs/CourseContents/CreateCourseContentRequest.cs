/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.CourseContents;

public class CreateCourseContentRequest
{
    public int CourseId { get; set; }

    public string ModuleName { get; set; } = string.Empty;

    public ContentType ContentType { get; set; }

    public string UrlOrPath { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;
}