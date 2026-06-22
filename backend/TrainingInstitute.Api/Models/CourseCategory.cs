/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Models;

// courses ko group karne ke liye - "Programming", "Data" wagaira
public class CourseCategory
{
    public int CourseCategoryId { get; set; }

    public string Name { get; set; } = string.Empty;

    // purani category delete nahi karte - IsActive false kar dete hai
    public bool IsActive { get; set; } = true;

    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
