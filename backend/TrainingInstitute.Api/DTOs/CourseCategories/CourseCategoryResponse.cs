/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.CourseCategories;


public class CourseCategoryResponse

{
    public int CourseCategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}