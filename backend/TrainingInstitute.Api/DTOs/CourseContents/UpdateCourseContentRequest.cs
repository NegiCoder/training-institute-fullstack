using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.CourseContents;

public class UpdateCourseContentRequest
{
    public string ModuleName { get; set; } = string.Empty;

    public ContentType ContentType { get; set; }

    public string UrlOrPath { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; }
}