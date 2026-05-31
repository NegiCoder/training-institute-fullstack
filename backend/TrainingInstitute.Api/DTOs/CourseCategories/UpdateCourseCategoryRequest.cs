namespace TrainingInstitute.Api.DTOs.CourseCategories;

public class UpdateCourseCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}