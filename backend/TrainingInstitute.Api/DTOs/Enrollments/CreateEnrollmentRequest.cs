namespace TrainingInstitute.Api.DTOs.Enrollments;

public class CreateEnrollmentRequest
{
    public int CourseId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
}