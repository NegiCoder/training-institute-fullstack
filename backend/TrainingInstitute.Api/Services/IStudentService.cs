/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.DTOs.Common;
using TrainingInstitute.Api.DTOs.Students;

namespace TrainingInstitute.Api.Services;


public interface IStudentService
{

  //USER METHODS
  Task<StudentProfileResponse> CreateMyProfileAsync(int userId, CreateStudentProfileRequest request);
  Task<StudentProfileResponse?> GetMyProfileAsync(int userId);
  Task<StudentProfileResponse?> UpdateMyProfileAsync(int userId, UpdateStudentProfileRequest request);


  //ADMIN METHOD
  Task<List<StudentProfileResponse>> GetAllStudentsAsync();


  // ADMIN METHOS
  Task<StudentProfileResponse?> GetStudentByIdAsync(int studentId);

Task<PagedResponse<StudentProfileResponse>> SearchAsync(StudentSearchRequest request);
}
