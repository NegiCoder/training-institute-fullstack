/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.Reports;

public class TopCourseResponse
{
    public int CourseId { get; set; }

    public string CourseTitle { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public int Count { get; set; }
}
