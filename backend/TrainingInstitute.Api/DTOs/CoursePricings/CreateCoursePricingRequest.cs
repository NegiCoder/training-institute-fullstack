namespace TrainingInstitute.Api.DTOs.CoursePricings;

public class CreateCoursePricingRequest
{
    public int CourseId { get; set; }

    public int Year { get; set; }

    public decimal Price { get; set; }

    public bool IsFree { get; set; }

    public DateTime? EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }
}