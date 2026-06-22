/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.DTOs.CourseTrainers;

namespace TrainingInstitute.Api.Services;

public interface ICourseTrainerService
{
    Task<List<CourseTrainerResponse>> GetTrainersByCourseIdAsync(int courseId);
    Task<List<CourseTrainerResponse>> GetCoursesByTrainerIdAsync(int trainerId);
    Task<CourseTrainerResponse> AssignTrainerAsync(AssignTrainerRequest request);
    Task<bool> RemoveTrainerAsync(int courseTrainerId);
}