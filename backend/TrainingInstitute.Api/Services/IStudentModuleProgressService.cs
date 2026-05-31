using TrainingInstitute.Api.DTOs.StudentModuleProgress;

namespace TrainingInstitute.Api.Services;

public interface IStudentModuleProgressService
{
    Task<StudentModuleProgressResponse> MarkModuleCompleteAsync(int userId, MarkModuleCompleteRequest request);
    Task<List<StudentModuleProgressResponse>> GetProgressByEnrollmentIdAsync(int userId, int courseEnrollmentId);
}