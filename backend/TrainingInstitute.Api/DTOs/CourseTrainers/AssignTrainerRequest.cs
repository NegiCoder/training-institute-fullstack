/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.CourseTrainers;

public class AssignTrainerRequest
{
    public int CourseId { get; set; }
    public int TrainerId { get; set; }
}