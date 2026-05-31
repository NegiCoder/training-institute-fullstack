namespace TrainingInstitute.Api.Models;

// admin ko chhoti reminders - jaise "agle saal ki price set karo"
public class AdminNotification
{
    public int AdminNotificationId { get; set; }

    // null = sab admin dekhe, set = sirf usi admin ki queue me
    public int? ForUserId { get; set; }

    public User? ForUser { get; set; }

    // string code jaise "YearlyPriceReview" - alag table abhi nahi banayi
    public string Type { get; set; } = string.Empty;

    public int? Year { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; }
}
