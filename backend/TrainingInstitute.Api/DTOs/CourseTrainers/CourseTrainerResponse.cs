/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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