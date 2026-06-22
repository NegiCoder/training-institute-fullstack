/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.DTOs.StudentModuleProgress;

namespace TrainingInstitute.Api.Services;

public interface IStudentModuleProgressService
{
    Task<StudentModuleProgressResponse> MarkModuleCompleteAsync(int userId, MarkModuleCompleteRequest request);
    Task<List<StudentModuleProgressResponse>> GetProgressByEnrollmentIdAsync(int userId, int courseEnrollmentId);
}