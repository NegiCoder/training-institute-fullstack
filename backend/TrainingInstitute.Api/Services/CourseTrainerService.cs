using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.CourseTrainers;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class CourseTrainerService : ICourseTrainerService
{
    private readonly TrainingInstituteDbContext _context;

    public CourseTrainerService(TrainingInstituteDbContext context)
    {
        _context = context;
    }

    public async Task<List<CourseTrainerResponse>> GetTrainersByCourseIdAsync(int courseId)
    {
        var trainers = await _context.CourseTrainers
            .Include(ct => ct.Course)
            .Include(ct => ct.Trainer)
            .Where(ct => ct.CourseId == courseId)
            .ToListAsync();

        return trainers.Select(MapToResponse).ToList();
    }

    public async Task<List<CourseTrainerResponse>> GetCoursesByTrainerIdAsync(int trainerId)
    {
        var courses = await _context.CourseTrainers
            .Include(ct => ct.Course)
            .Include(ct => ct.Trainer)
            .Where(ct => ct.TrainerId == trainerId)
            .ToListAsync();

        return courses.Select(MapToResponse).ToList();
    }

    public async Task<CourseTrainerResponse> AssignTrainerAsync(AssignTrainerRequest request)
    {
        var courseExists = await _context.Courses
            .AnyAsync(c => c.CourseId == request.CourseId && c.Status != CourseStatus.Archived);

        if (!courseExists)
        {
            throw new InvalidOperationException("Course not found or archived.");
        }

        var trainer = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == request.TrainerId && u.IsActive);

        if (trainer == null)
        {
            throw new InvalidOperationException("Trainer user not found or inactive.");
        }

        if (trainer.Role != UserRole.Trainer)
        {
            throw new InvalidOperationException("Selected user is not a trainer.");
        }

        var alreadyAssigned = await _context.CourseTrainers
            .AnyAsync(ct => ct.CourseId == request.CourseId && ct.TrainerId == request.TrainerId);

        if (alreadyAssigned)
        {
            throw new InvalidOperationException("Trainer is already assigned to this course.");
        }

        var courseTrainer = new CourseTrainer
        {
            CourseId = request.CourseId,
            TrainerId = request.TrainerId,
            AssignedAt = DateTime.UtcNow
        };

        _context.CourseTrainers.Add(courseTrainer);
        await _context.SaveChangesAsync();

        var createdAssignment = await _context.CourseTrainers
            .Include(ct => ct.Course)
            .Include(ct => ct.Trainer)
            .FirstAsync(ct => ct.CourseTrainerId == courseTrainer.CourseTrainerId);

        return MapToResponse(createdAssignment);
    }

    public async Task<bool> RemoveTrainerAsync(int courseTrainerId)
    {
        var courseTrainer = await _context.CourseTrainers
            .FirstOrDefaultAsync(ct => ct.CourseTrainerId == courseTrainerId);

        if (courseTrainer == null)
        {
            return false;
        }

        _context.CourseTrainers.Remove(courseTrainer);
        await _context.SaveChangesAsync();

        return true;
    }

    private static CourseTrainerResponse MapToResponse(CourseTrainer courseTrainer)
    {
        return new CourseTrainerResponse
        {
            CourseTrainerId = courseTrainer.CourseTrainerId,
            CourseId = courseTrainer.CourseId,
            CourseTitle = courseTrainer.Course?.Title ?? string.Empty,
            TrainerId = courseTrainer.TrainerId,
            TrainerFullName = courseTrainer.Trainer?.FullName ?? string.Empty,
            TrainerEmail = courseTrainer.Trainer?.Email ?? string.Empty,
            AssignedAt = courseTrainer.AssignedAt
        };
    }
}