using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.Common;
using TrainingInstitute.Api.DTOs.Enrollments;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly TrainingInstituteDbContext _context;

    public EnrollmentService(TrainingInstituteDbContext context)
    {
        _context = context;
    }

    public async Task<EnrollmentResponse> CreateMyEnrollmentAsync(int userId, CreateEnrollmentRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            throw new InvalidOperationException("Student profile not found. Please complete your profile first.");
        }

        var courseExists = await _context.Courses
            .AnyAsync(c => c.CourseId == request.CourseId && c.Status == CourseStatus.Published);

        if (!courseExists)
        {
            throw new InvalidOperationException("Course not found or not published.");
        }

        var alreadyEnrolled = await _context.CourseEnrollments
            .AnyAsync(e =>
                e.StudentId == student.StudentId &&
                e.CourseId == request.CourseId &&
                e.Status != EnrollmentStatus.Cancelled);

        if (alreadyEnrolled)
        {
            throw new InvalidOperationException("You are already enrolled in this course.");
        }

        var enrollment = new CourseEnrollment
        {
            StudentId = student.StudentId,
            CourseId = request.CourseId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = EnrollmentStatus.Assigned,
            ProgressPercentage = 0,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.CourseEnrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        var createdEnrollment = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstAsync(e => e.CourseEnrollmentId == enrollment.CourseEnrollmentId);

        return MapToResponse(createdEnrollment);
    }

    public async Task<List<EnrollmentResponse>> GetMyEnrollmentsAsync(int userId)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            return new List<EnrollmentResponse>();
        }

        var enrollments = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Where(e => e.StudentId == student.StudentId)
            .ToListAsync();

        return enrollments.Select(MapToResponse).ToList();
    }

    public async Task<List<EnrollmentResponse>> GetTrainerEnrollmentsAsync(int trainerUserId)
    {
        // is trainer ko kaunse kaunse course assigned hai
        var assignedCourseIds = await _context.CourseTrainers
            .Where(ct => ct.TrainerId == trainerUserId)
            .Select(ct => ct.CourseId)
            .ToListAsync();

        if (assignedCourseIds.Count == 0)
        {
            return new List<EnrollmentResponse>();
        }

        var enrollments = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Where(e => assignedCourseIds.Contains(e.CourseId))
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return enrollments.Select(MapToResponse).ToList();
    }

    public async Task<List<EnrollmentResponse>> GetAllEnrollmentsAsync()
    {
        var enrollments = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .ToListAsync();

        return enrollments.Select(MapToResponse).ToList();
    }

    public async Task<EnrollmentResponse?> GetEnrollmentByIdAsync(int courseEnrollmentId)
    {
        var enrollment = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.CourseEnrollmentId == courseEnrollmentId);

        if (enrollment == null)
        {
            return null;
        }

        return MapToResponse(enrollment);
    }

    public async Task<EnrollmentResponse?> UpdateStatusAsync(
        int courseEnrollmentId,
        int adminUserId,
        UpdateEnrollmentStatusRequest request)
    {
        var enrollment = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.CourseEnrollmentId == courseEnrollmentId);

        if (enrollment == null)
        {
            return null;
        }

        enrollment.Status = request.Status;
        enrollment.UpdatedAt = DateTime.UtcNow;
        enrollment.UpdatedBy = adminUserId;

        if (request.Status == EnrollmentStatus.Completed)
        {
            enrollment.CompletedAt = DateTime.UtcNow;
            enrollment.CompletedByAdminId = adminUserId;
            enrollment.ProgressPercentage = 100;
        }

        await _context.SaveChangesAsync();

        return MapToResponse(enrollment);
    }

    public async Task<PagedResponse<EnrollmentResponse>> SearchAsync(EnrollmentSearchRequest request)
    {
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var query = _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.Trim();

            query = query.Where(e =>
                (e.Student != null &&
                 EF.Functions.Like(e.Student.FirstName + " " + e.Student.LastName, $"%{searchTerm}%")) ||
                (e.Course != null &&
                 EF.Functions.Like(e.Course.Title, $"%{searchTerm}%")));
        }

        if (request.StudentId.HasValue)
        {
            query = query.Where(e => e.StudentId == request.StudentId.Value);
        }

        if (request.CourseId.HasValue)
        {
            query = query.Where(e => e.CourseId == request.CourseId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(e => e.Status == request.Status.Value);
        }

        if (request.StartDateFrom.HasValue)
        {
            query = query.Where(e => e.StartDate >= request.StartDateFrom.Value);
        }

        if (request.StartDateTo.HasValue)
        {
            query = query.Where(e => e.StartDate <= request.StartDateTo.Value);
        }

        var totalCount = await query.CountAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var enrollments = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<EnrollmentResponse>
        {
            Items = enrollments.Select(MapToResponse).ToList(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = pageNumber > 1,
            HasNextPage = pageNumber < totalPages
        };
    }

    private static EnrollmentResponse MapToResponse(CourseEnrollment enrollment)
    {
        return new EnrollmentResponse
        {
            CourseEnrollmentId = enrollment.CourseEnrollmentId,
            StudentId = enrollment.StudentId,
            StudentName = enrollment.Student == null
                ? string.Empty
                : $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
            CourseId = enrollment.CourseId,
            CourseTitle = enrollment.Course?.Title ?? string.Empty,
            StartDate = enrollment.StartDate,
            EndDate = enrollment.EndDate,
            Status = enrollment.Status,
            ProgressPercentage = enrollment.ProgressPercentage,
            CompletedAt = enrollment.CompletedAt,
            CreatedAt = enrollment.CreatedAt,
            UpdatedAt = enrollment.UpdatedAt
        };
    }
}