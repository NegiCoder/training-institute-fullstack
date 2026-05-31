using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.CourseContents;

public class CourseContentResponse
{
    public int CourseContentId { get; set; }

    public int CourseId { get; set; }

    public string CourseTitle { get; set; } = string.Empty;

    public string ModuleName { get; set; } = string.Empty;

    public ContentType ContentType { get; set; }

    public string UrlOrPath { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}