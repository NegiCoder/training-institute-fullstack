using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.Common;
using TrainingInstitute.Api.DTOs.Students;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class StudentService : IStudentService
{
    private readonly TrainingInstituteDbContext _context;

    public StudentService(TrainingInstituteDbContext context)
    {
        _context = context;
    }

    public async Task<StudentProfileResponse> CreateMyProfileAsync(int userId, CreateStudentProfileRequest request)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (user.Role != UserRole.Student)
        {
            throw new InvalidOperationException("Only students can create a student profile");
        }

        var profileAlreadyExists = await _context.Students.AnyAsync(sp => sp.UserId == userId);

        if (profileAlreadyExists)
        {
            throw new InvalidOperationException("Student profile already exists for this user");
        }

        var student = new Student
        {
            UserId = userId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            City = request.City,
            DateOfBirth = request.DateOfBirth,
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            GuardianName = request.GuardianName,
            EmergencyPhone = request.EmergencyPhone,
            CollegeName = request.CollegeName,
            PassoutYear = request.PassoutYear,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        student.User = user;
        return MapToResponse(student);
    }

    public async Task<StudentProfileResponse?> GetMyProfileAsync(int userId)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            return null;
        }

        return MapToResponse(student);
    }

    public async Task<StudentProfileResponse?> UpdateMyProfileAsync(int userId, UpdateStudentProfileRequest request)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            return null;
        }

        student.FirstName = request.FirstName;
        student.LastName = request.LastName;
        student.Phone = request.Phone;
        student.City = request.City;
        student.DateOfBirth = request.DateOfBirth;
        student.AddressLine1 = request.AddressLine1;
        student.AddressLine2 = request.AddressLine2;
        student.GuardianName = request.GuardianName;
        student.EmergencyPhone = request.EmergencyPhone;
        student.CollegeName = request.CollegeName;
        student.PassoutYear = request.PassoutYear;
        student.UpdatedAt = DateTime.UtcNow;
        student.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        return MapToResponse(student);
    }

    public async Task<StudentProfileResponse?> GetStudentByIdAsync(int studentId)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.StudentId == studentId);

        if (student == null)
        {
            return null;
        }

        return MapToResponse(student);
    }

    public async Task<List<StudentProfileResponse>> GetAllStudentsAsync()
    {
        var students = await _context.Students
            .Include(s => s.User)
            .ToListAsync();

        return students.Select(MapToResponse).ToList();
    }

    public async Task<PagedResponse<StudentProfileResponse>> SearchAsync(StudentSearchRequest request)
    {
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var query = _context.Students
            .Include(s => s.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.Trim();

            query = query.Where(s =>
                EF.Functions.Like(s.FirstName, $"%{searchTerm}%") ||
                EF.Functions.Like(s.LastName, $"%{searchTerm}%") ||
                (s.User != null && EF.Functions.Like(s.User.FullName, $"%{searchTerm}%")) ||
                (s.User != null && EF.Functions.Like(s.User.Email, $"%{searchTerm}%")));
        }

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            query = query.Where(s => s.City != null && s.City == request.City);
        }

        if (!string.IsNullOrWhiteSpace(request.CollegeName))
        {
            var collegeName = request.CollegeName.Trim();

            query = query.Where(s =>
                s.CollegeName != null &&
                EF.Functions.Like(s.CollegeName, $"%{collegeName}%"));
        }

        if (request.PassoutYear.HasValue)
        {
            query = query.Where(s => s.PassoutYear == request.PassoutYear.Value);
        }

        var totalCount = await query.CountAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var students = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<StudentProfileResponse>
        {
            Items = students.Select(MapToResponse).ToList(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = pageNumber > 1,
            HasNextPage = pageNumber < totalPages
        };
    }

    private static StudentProfileResponse MapToResponse(Student student)
    {
        return new StudentProfileResponse
        {
            StudentId = student.StudentId,
            UserId = student.UserId,
            FullName = student.User?.FullName ?? string.Empty,
            Email = student.User?.Email ?? string.Empty,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Phone = student.Phone,
            City = student.City,
            DateOfBirth = student.DateOfBirth,
            AddressLine1 = student.AddressLine1,
            AddressLine2 = student.AddressLine2,
            GuardianName = student.GuardianName,
            EmergencyPhone = student.EmergencyPhone,
            CollegeName = student.CollegeName,
            PassoutYear = student.PassoutYear,
            CreatedAt = student.CreatedAt,
            UpdatedAt = student.UpdatedAt
        };
    }
}