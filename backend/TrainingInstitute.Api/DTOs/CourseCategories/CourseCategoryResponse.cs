namespace TrainingInstitute.Api.DTOs.CourseCategories;


public class CourseCategoryResponse

{
    public int CourseCategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}