/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Models;

// course aur trainer ka link - ek trainer ek course pe bas ek hi baar
public class CourseTrainer
{
    public int CourseTrainerId { get; set; }

    public int CourseId { get; set; }

    public Course? Course { get; set; }

    // Users.UserId jiska Role = Trainer hoga - role ka check app me karenge
    public int TrainerId { get; set; }

    public User? Trainer { get; set; }

    public DateTime AssignedAt { get; set; }
}
