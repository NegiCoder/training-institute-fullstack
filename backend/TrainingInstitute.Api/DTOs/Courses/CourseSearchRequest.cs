using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.Courses;

public class CourseSearchRequest
{
    public string? SearchTerm { get; set; }

    public int? CourseCategoryId { get; set; }

    public string? Level { get; set; }

    public string? Mode { get; set; }

    public CourseStatus? Status { get; set; }

    public bool? IsOpenAccess { get; set; }

    public bool? IsFeatured { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}