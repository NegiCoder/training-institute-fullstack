using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Models;

// actual course - price yaha nahi rakhi, CoursePricing me saal ke hisab se hai
public class Course
{
    public int CourseId { get; set; }

    public int CourseCategoryId { get; set; }

    public CourseCategory? Category { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    // beginner / intermediate type label - abhi string me hi rakha
    public string Level { get; set; } = string.Empty;

    // online / offline / hybrid - bhi string me, baad me enum bana sakte
    public string Mode { get; set; } = string.Empty;

    // human friendly duration jaise "8 weeks"
    public string Duration { get; set; } = string.Empty;

    public CourseStatus Status { get; set; }

    public bool IsFeatured { get; set; }

    // kis admin ne featured ka button daba - optional
    public int? FeaturedByUserId { get; set; }

    public User? FeaturedByUser { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public ICollection<CoursePricing> Pricings { get; set; } = new List<CoursePricing>();

    public ICollection<CourseContent> Contents { get; set; } = new List<CourseContent>();

    public ICollection<CourseTrainer> Trainers { get; set; } = new List<CourseTrainer>();

    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
}
