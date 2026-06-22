/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.DTOs.Common;
using TrainingInstitute.Api.DTOs.Enrollments;

namespace TrainingInstitute.Api.Services;

public interface IEnrollmentService
{
  Task<EnrollmentResponse> CreateMyEnrollmentAsync(int userId, CreateEnrollmentRequest request);
  Task<List<EnrollmentResponse>> GetMyEnrollmentsAsync(int userId);
  Task<List<EnrollmentResponse>> GetTrainerEnrollmentsAsync(int trainerUserId);
  Task<List<EnrollmentResponse>> GetAllEnrollmentsAsync();
  Task<EnrollmentResponse?> GetEnrollmentByIdAsync(int courseEnrollmentId);
  Task<EnrollmentResponse?> UpdateStatusAsync(int courseEnrollmentId, int adminUserId, UpdateEnrollmentStatusRequest request);
    
    Task<PagedResponse<EnrollmentResponse>> SearchAsync(EnrollmentSearchRequest request);
}