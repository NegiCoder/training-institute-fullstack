/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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