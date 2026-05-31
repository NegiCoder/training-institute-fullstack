namespace TrainingInstitute.Api.DTOs.Students;

public class StudentSearchRequest
{
    public string? SearchTerm { get; set; }

    public string? City { get; set; }

    public string? CollegeName { get; set; }

    public int? PassoutYear { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}