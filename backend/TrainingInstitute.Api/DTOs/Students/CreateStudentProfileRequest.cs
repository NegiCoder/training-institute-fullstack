namespace TrainingInstitute.Api.DTOs.Students;

public class CreateStudentProfileRequest
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? City { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? GuardianName { get; set; }

    public string? EmergencyPhone { get; set; }

    public string? CollegeName { get; set; }

    public int? PassoutYear { get; set; }
}