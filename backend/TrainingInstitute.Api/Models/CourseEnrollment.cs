using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Models;

// student X ne course Y le rakha hai - dates aur status ke saath
public class CourseEnrollment
{
    public int CourseEnrollmentId { get; set; }

    // Student se link - sidha User se nahi karte
    public int StudentId { get; set; }

    public Student? Student { get; set; }

    public int CourseId { get; set; }

    public Course? Course { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public EnrollmentStatus Status { get; set; }

    // dashboard ke liye approx % - module wise detail StudentModuleProgress me
    public int ProgressPercentage { get; set; }

    public DateTime? CompletedAt { get; set; }

    // kis admin ne complete mark kiya - certificate / report me chahiye
    public int? CompletedByAdminId { get; set; }

    public User? CompletedByAdmin { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    // cert tabhi banegi jab admin complete kare - optional
    public CertificateIssued? Certificate { get; set; }

    public ICollection<StudentModuleProgress> ModuleProgress { get; set; } = new List<StudentModuleProgress>();
}
