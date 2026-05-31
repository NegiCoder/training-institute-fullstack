using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.StudentModuleProgress;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class StudentModuleProgressService : IStudentModuleProgressService
{
    private readonly TrainingInstituteDbContext _context;

    public StudentModuleProgressService(TrainingInstituteDbContext context)
    {
        _context = context;
    }

    public async Task<StudentModuleProgressResponse> MarkModuleCompleteAsync(int userId, MarkModuleCompleteRequest request)
    {
        var enrollment = await _context.CourseEnrollments
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.CourseEnrollmentId == request.CourseEnrollmentId);

        if (enrollment == null)
        {
            throw new InvalidOperationException("Enrollment not found.");
        }

        if (enrollment.Student == null || enrollment.Student.UserId != userId)
        {
            throw new InvalidOperationException("You can only update your own enrollment progress.");
        }

        if (enrollment.Status == EnrollmentStatus.Cancelled)
        {
            throw new InvalidOperationException("Cannot update progress for cancelled enrollment.");
        }

        var content = await _context.CourseContents
            .FirstOrDefaultAsync(c =>
                c.CourseContentId == request.CourseContentId &&
                c.CourseId == enrollment.CourseId &&
                c.IsActive);

        if (content == null)
        {
            throw new InvalidOperationException("Course module not found for this enrollment course.");
        }

        var alreadyCompleted = await _context.StudentModuleProgress
            .AnyAsync(p =>
                p.CourseEnrollmentId == request.CourseEnrollmentId &&
                p.CourseContentId == request.CourseContentId);

        if (alreadyCompleted)
        {
            throw new InvalidOperationException("Module is already completed.");
        }

        var progress = new StudentModuleProgress
        {
            CourseEnrollmentId = request.CourseEnrollmentId,
            CourseContentId = request.CourseContentId,
            CompletedAt = DateTime.UtcNow
        };

        _context.StudentModuleProgress.Add(progress);
        await _context.SaveChangesAsync();

        var progressPercentage = await RecalculateProgressAsync(enrollment);

        var createdProgress = await _context.StudentModuleProgress
            .Include(p => p.Content)
            .FirstAsync(p => p.StudentModuleProgressId == progress.StudentModuleProgressId);

        return MapToResponse(createdProgress, progressPercentage);
    }

    public async Task<List<StudentModuleProgressResponse>> GetProgressByEnrollmentIdAsync(int userId, int courseEnrollmentId)
    {
        var enrollment = await _context.CourseEnrollments
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.CourseEnrollmentId == courseEnrollmentId);

        if (enrollment == null)
        {
            return new List<StudentModuleProgressResponse>();
        }

        if (enrollment.Student == null || enrollment.Student.UserId != userId)
        {
            throw new InvalidOperationException("You can only view your own enrollment progress.");
        }

        var progressRows = await _context.StudentModuleProgress
            .Include(p => p.Content)
            .Where(p => p.CourseEnrollmentId == courseEnrollmentId)
            .OrderBy(p => p.Content!.SortOrder)
            .ToListAsync();

        return progressRows
            .Select(p => MapToResponse(p, enrollment.ProgressPercentage))
            .ToList();
    }

    private async Task<int> RecalculateProgressAsync(CourseEnrollment enrollment)
    {
        var totalModules = await _context.CourseContents
            .CountAsync(c => c.CourseId == enrollment.CourseId && c.IsActive);

        if (totalModules == 0)
        {
            enrollment.ProgressPercentage = 0;
            await _context.SaveChangesAsync();
            return 0;
        }

        var completedModules = await _context.StudentModuleProgress
            .CountAsync(p => p.CourseEnrollmentId == enrollment.CourseEnrollmentId);

        var progressPercentage = (int)Math.Round((completedModules * 100.0) / totalModules);

        enrollment.ProgressPercentage = progressPercentage;

        if (progressPercentage > 0 && enrollment.Status == EnrollmentStatus.Assigned)
        {
            enrollment.Status = EnrollmentStatus.InProgress;
        }

        await _context.SaveChangesAsync();

        return progressPercentage;
    }

    private static StudentModuleProgressResponse MapToResponse(StudentModuleProgress progress, int progressPercentage)
    {
        return new StudentModuleProgressResponse
        {
            StudentModuleProgressId = progress.StudentModuleProgressId,
            CourseEnrollmentId = progress.CourseEnrollmentId,
            CourseContentId = progress.CourseContentId,
            ModuleName = progress.Content?.ModuleName ?? string.Empty,
            CompletedAt = progress.CompletedAt,
            ProgressPercentage = progressPercentage
        };
    }
}