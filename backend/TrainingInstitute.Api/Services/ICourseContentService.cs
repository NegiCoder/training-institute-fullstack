using TrainingInstitute.Api.DTOs.CourseContents;

namespace TrainingInstitute.Api.Services;

public interface ICourseContentService
{
    Task<List<CourseContentResponse>> GetAllModuleByCourseIdAsync(int courseId);

    Task<CourseContentResponse?> GetModuleByIdAsync(int courseContentId);

    Task<CourseContentResponse> CreateModuleAsync(int userId, CreateCourseContentRequest request);

    Task<CourseContentResponse?> UpdateModuleAsync(int courseContentId, int userId, UpdateCourseContentRequest request);

    Task<bool> DeleteModuleAsync(int courseContentId, int userId);
}