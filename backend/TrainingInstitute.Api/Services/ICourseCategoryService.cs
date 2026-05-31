using TrainingInstitute.Api.DTOs.CourseCategories;

namespace TrainingInstitute.Api.Services;


public interface ICourseCategoryService
{
    Task<List<CourseCategoryResponse>> GetAllAsync();
    Task<CourseCategoryResponse?> GetByIdAsync(int courseCategoryId);

    Task<CourseCategoryResponse> CreateAsync(CreateCourseCategoryRequest request);

    Task<CourseCategoryResponse?> UpdateAsync(int courseCategoryId, UpdateCourseCategoryRequest request);
    
    Task<bool> DeleteAsync(int courseCategoryId);




}