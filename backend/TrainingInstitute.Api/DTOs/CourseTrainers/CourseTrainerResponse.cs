namespace TrainingInstitute.Api.DTOs.CourseTrainers;

public class CourseTrainerResponse
{
    public int CourseTrainerId { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int TrainerId { get; set; }
    public string TrainerFullName { get; set; } = string.Empty;
    public string TrainerEmail { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}