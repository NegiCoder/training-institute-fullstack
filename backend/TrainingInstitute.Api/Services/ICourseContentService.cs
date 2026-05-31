using TrainingInstitute.Api.DTOs.CourseContents;

namespace TrainingInstitute.Api.Services;

public interface ICourseContentService
{
    Task<List<CourseContentResponse>> GetAllModuleByCourseIdAsync(
        int courseId,
        int? userId = null,
        bool isAdmin = false,
        bool isTrainer = false);

    Task<CourseContentResponse?> GetModuleByIdAsync(
        int courseContentId,
        int? userId = null,
        bool isAdmin = false,
        bool isTrainer = false);

    Task<CourseContentResponse> CreateModuleAsync(int userId, CreateCourseContentRequest request);

    Task<CourseContentResponse?> UpdateModuleAsync(int courseContentId, int userId, UpdateCourseContentRequest request);

    Task<bool> DeleteModuleAsync(int courseContentId, int userId);
}