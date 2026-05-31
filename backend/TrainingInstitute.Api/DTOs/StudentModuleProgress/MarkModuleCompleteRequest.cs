namespace TrainingInstitute.Api.DTOs.StudentModuleProgress;

public class MarkModuleCompleteRequest
{
    public int CourseEnrollmentId { get; set; }
    public int CourseContentId { get; set; }
}