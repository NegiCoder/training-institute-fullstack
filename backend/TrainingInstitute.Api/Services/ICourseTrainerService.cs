using TrainingInstitute.Api.DTOs.CourseTrainers;

namespace TrainingInstitute.Api.Services;

public interface ICourseTrainerService
{
    Task<List<CourseTrainerResponse>> GetTrainersByCourseIdAsync(int courseId);
    Task<List<CourseTrainerResponse>> GetCoursesByTrainerIdAsync(int trainerId);
    Task<CourseTrainerResponse> AssignTrainerAsync(AssignTrainerRequest request);
    Task<bool> RemoveTrainerAsync(int courseTrainerId);
}