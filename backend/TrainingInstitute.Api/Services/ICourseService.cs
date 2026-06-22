/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.DTOs.Common;
using TrainingInstitute.Api.DTOs.Courses;

namespace TrainingInstitute.Api.Services;

public interface ICourseService
{
    Task<List<CourseResponse>> GetAllAsync(bool includeDrafts = false);

    Task<CourseResponse?> GetByIdAsync(int courseId, bool includeDrafts = false);

    Task<PagedResponse<CourseResponse>> SearchAsync(CourseSearchRequest request, bool includeDrafts = false);

    Task<CourseResponse> CreateAsync(int userId, CreateCourseRequest request);

    Task<CourseResponse?> UpdateAsync(int courseId, int userId, UpdateCourseRequest request);

    Task<bool> DeleteAsync(int courseId, int userId);
}