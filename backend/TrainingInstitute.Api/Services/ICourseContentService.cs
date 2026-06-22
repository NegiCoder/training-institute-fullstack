/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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