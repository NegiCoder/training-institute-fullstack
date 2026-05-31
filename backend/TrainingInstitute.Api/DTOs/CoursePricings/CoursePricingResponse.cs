namespace TrainingInstitute.Api.DTOs.CoursePricings;

public class CoursePricingResponse
{
    public int CoursePricingId { get; set; }

    public int CourseId { get; set; }

    public string CourseTitle { get; set; } = string.Empty;

    public int Year { get; set; }

    public decimal Price { get; set; }

    public bool IsFree { get; set; }

    public DateTime? EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}