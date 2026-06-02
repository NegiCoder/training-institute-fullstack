namespace TrainingInstitute.Api.Models;

// in-app notifications - ek row per recipient
public class Notification
{
    public int NotificationId { get; set; }

    // jis user ko ye notification dikhani hai (admin / trainer / student)
    public int UserId { get; set; }

    public User? User { get; set; }

    // semantic code jaise "CourseCompleted" / "CertificateIssued"
    public string Type { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    // optional deep link in the frontend
    public string? Link { get; set; }

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; }
}

public static class NotificationTypes
{
    public const string CourseCompleted = "CourseCompleted";
    public const string CertificateIssued = "CertificateIssued";
}
