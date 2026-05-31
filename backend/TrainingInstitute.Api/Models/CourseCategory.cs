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
