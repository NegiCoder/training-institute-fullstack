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

    public bool IsOpenAccess { get; set; }

    public bool IsFeatured { get; set; }
}