/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.DTOs.Reports;

namespace TrainingInstitute.Api.Services;

public interface IReportService
{
    Task<ReportsOverviewResponse> GetOverviewAsync();

    Task<List<CoursePerformanceResponse>> GetCoursePerformanceAsync();

    Task<List<TopCourseResponse>> GetTopCoursesAsync(string metric, int limit);

    Task<List<EnrollmentTrendPointResponse>> GetEnrollmentTrendAsync(int months);

    Task<List<TrainerPerformanceResponse>> GetTrainerPerformanceAsync();

    Task<List<CategoryPerformanceResponse>> GetCategoryPerformanceAsync();

    Task<StudentEngagementResponse> GetStudentEngagementAsync(
        int idleDays = 60,
        int limit = 10);

    Task<string> GetCoursePerformanceCsvAsync();

    Task<string> GetTopCoursesCsvAsync(string metric, int limit);

    Task<string> GetEnrollmentTrendCsvAsync(int months);

    Task<string> GetTrainerPerformanceCsvAsync();

    Task<string> GetCategoryPerformanceCsvAsync();

    Task<string> GetStudentEngagementCsvAsync(int idleDays = 60, int limit = 10);
}
