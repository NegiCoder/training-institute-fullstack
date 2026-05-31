namespace TrainingInstitute.Api.DTOs.StudentModuleProgress;

public class StudentModuleProgressResponse
{
    public int StudentModuleProgressId { get; set; }

    public int CourseEnrollmentId { get; set; }

    public int CourseContentId { get; set; }

    public string ModuleName { get; set; } = string.Empty;

    public DateTime CompletedAt { get; set; }

    public int ProgressPercentage { get; set; }
}