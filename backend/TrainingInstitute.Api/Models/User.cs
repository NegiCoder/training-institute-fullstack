/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Models;

// login karne wale sab users - student, trainer, admin tino isi me
// student ke extra fields Student class me hai, yaha repeat nahi kiya
public class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    // login me yahi use hota hai - unique hona chahiye
    public string Email { get; set; } = string.Empty;

    // password kabhi plain me save nahi karna - hash karke rakhna hai
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    // false kar do agar user chala gaya / login nahi karna chahiye
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    // sirf student role wale ka hoga - trainer / admin ka null rahega
    public Student? StudentProfile { get; set; }

    // trainer kis kis course me hai - join table ki rows
    public ICollection<CourseTrainer> TrainerCourseLinks { get; set; } = new List<CourseTrainer>();

    // in-app notifications jo is user ke liye banayi gayi hain
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
