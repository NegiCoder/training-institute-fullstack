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
