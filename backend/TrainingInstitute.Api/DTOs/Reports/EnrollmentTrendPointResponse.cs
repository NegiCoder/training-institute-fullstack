namespace TrainingInstitute.Api.DTOs.Reports;

public class EnrollmentTrendPointResponse
{
    public int Year { get; set; }

    public int Month { get; set; }

    public string Label { get; set; } = string.Empty;

    public int EnrollmentCount { get; set; }
}
