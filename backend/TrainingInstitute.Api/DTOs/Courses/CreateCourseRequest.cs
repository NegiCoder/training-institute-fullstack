/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.Courses;

public class CreateCourseRequest
{
    public int CourseCategoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Level { get; set; } = string.Empty;

    public string Mode { get; set; } = string.Empty;

    public string Duration { get; set; } = string.Empty;

    public CourseStatus Status { get; set; } = CourseStatus.Draft;

    public bool IsFeatured { get; set; }
}