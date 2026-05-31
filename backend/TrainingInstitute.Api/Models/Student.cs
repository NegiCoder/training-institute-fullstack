namespace TrainingInstitute.Api.Models;

// learner ki profile - email login ke liye User table me hi rakha hai
public class Student
{
    public int StudentId { get; set; }

    // User.UserId se jura hua - ek user ka ek hi student profile (unique)
    public int UserId { get; set; }

    public User? User { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? City { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? GuardianName { get; set; }

    public string? EmergencyPhone { get; set; }

    public string?CollegeName { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }
    public int? PassoutYear{get;set;}

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    // is student ne kaun kaun se course liye hai
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
}
