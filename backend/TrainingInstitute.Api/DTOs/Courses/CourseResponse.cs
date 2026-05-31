using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.Courses;

public class CourseResponse
{
    public int CourseId { get; set; }

    public int CourseCategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Level { get; set; } = string.Empty;

    public string Mode { get; set; } = string.Empty;

    public string Duration { get; set; } = string.Empty;

    public CourseStatus Status { get; set; }

    public bool IsFeatured { get; set; }

    public bool IsFree { get; set; }

    public decimal? CurrentPrice { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}