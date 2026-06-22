/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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