namespace TrainingInstitute.Api.DTOs.Reports;

public class TopCourseResponse
{
    public int CourseId { get; set; }

    public string CourseTitle { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public int Count { get; set; }
}
