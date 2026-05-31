using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.DTOs.Enrollments;

public class UpdateEnrollmentStatusRequest
{
    public EnrollmentStatus Status { get; set; }
}