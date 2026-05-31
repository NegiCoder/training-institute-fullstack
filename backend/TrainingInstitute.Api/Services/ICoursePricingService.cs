using TrainingInstitute.Api.DTOs.CoursePricings;

namespace TrainingInstitute.Api.Services;

public interface ICoursePricingService
{
    Task<List<CoursePricingResponse>> GetByCourseIdAsync(int courseId);
    Task<CoursePricingResponse?> GetByIdAsync(int coursePricingId);
    Task<CoursePricingResponse> CreateAsync(int userId, CreateCoursePricingRequest request);
    Task<CoursePricingResponse?> UpdateAsync(int coursePricingId, int userId, UpdateCoursePricingRequest request);
    Task<bool> DeleteAsync(int coursePricingId);
}