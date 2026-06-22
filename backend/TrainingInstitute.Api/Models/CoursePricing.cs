/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Models;

// ek course ki price ek saal ke liye - (CourseId + Year) ki jodi unique hai
public class CoursePricing
{
    public int CoursePricingId { get; set; }

    public int CourseId { get; set; }

    public Course? Course { get; set; }

    // 2025, 2026 wagaira
    public int Year { get; set; }

    public decimal Price { get; set; }

    // free course bhi ho sakta hai - tab bhi row banao taki pata rahe socha tha
    public bool IsFree { get; set; }

    public DateTime? EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }
}
