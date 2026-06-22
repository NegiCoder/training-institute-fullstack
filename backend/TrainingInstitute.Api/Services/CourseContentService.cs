/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.CourseContents;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class CourseContentService : ICourseContentService
{
    private readonly TrainingInstituteDbContext _dbcontext;

    public CourseContentService(TrainingInstituteDbContext dbcontext)
    {
        _dbcontext = dbcontext;
    }


    public async Task<List<CourseContentResponse>> GetAllModuleByCourseIdAsync(
        int courseId,
        int? userId = null,
        bool isAdmin = false,
        bool isTrainer = false)
    {
        var course = await _dbcontext.Courses
            .FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null)
        {
            return new List<CourseContentResponse>();
        }

        var canAccessUrl = await CanAccessCourseUrlAsync(course, userId, isAdmin, isTrainer);

        var content = await _dbcontext.CourseContents
        .Include(c => c.Course)
        .Where(c => c.CourseId == courseId && c.IsActive)
        .OrderBy(c => c.SortOrder)
        .ToListAsync();

        return content.Select(c => MapToResponse(c, canAccessUrl)).ToList();
    }

    public async Task<CourseContentResponse?> GetModuleByIdAsync(
        int courseContentId,
        int? userId = null,
        bool isAdmin = false,
        bool isTrainer = false)
    {
        var content = await _dbcontext.CourseContents
        .Include(c => c.Course)
        .FirstOrDefaultAsync(c => c.CourseContentId == courseContentId && c.IsActive);


        if (content == null)
        {
            return null;
        }

        var canAccessUrl = content.Course != null &&
            await CanAccessCourseUrlAsync(content.Course, userId, isAdmin, isTrainer);

        return MapToResponse(content, canAccessUrl);
    }

    private async Task<bool> CanAccessCourseUrlAsync(
        Course course,
        int? userId,
        bool isAdmin,
        bool isTrainer)
    {
        if (isAdmin)
        {
            return true;
        }

        if (!userId.HasValue)
        {
            return false;
        }

        if (isTrainer)
        {
            return await _dbcontext.CourseTrainers
                .AnyAsync(ct => ct.CourseId == course.CourseId && ct.TrainerId == userId.Value);
        }

        var student = await _dbcontext.Students
            .FirstOrDefaultAsync(s => s.UserId == userId.Value);

        if (student == null)
        {
            return false;
        }

        return await _dbcontext.CourseEnrollments
            .AnyAsync(e =>
                e.CourseId == course.CourseId &&
                e.StudentId == student.StudentId &&
                e.Status != EnrollmentStatus.Cancelled);
    }


    public async Task<CourseContentResponse> CreateModuleAsync(int userId, CreateCourseContentRequest request)
    {
        var courseExist = await _dbcontext.Courses
        .AnyAsync(c => c.CourseId == request.CourseId && c.Status != CourseStatus.Archived);


        if (!courseExist)
        {
            throw new InvalidOperationException("Course not found or archived.");
        }

        // trainer ke paas is course ka assignment hona chahiye - warna content add karne ki permission nahi
        var isAssignedTrainer = await _dbcontext.CourseTrainers
            .AnyAsync(ct => ct.CourseId == request.CourseId && ct.TrainerId == userId);

        if (!isAssignedTrainer)
        {
            throw new InvalidOperationException("You are not assigned to this course.");
        }

        var content = new CourseContent
        {
            CourseId = request.CourseId,
            ModuleName = request.ModuleName,
            ContentType = request.ContentType,
            UrlOrPath = request.UrlOrPath,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };


        await _dbcontext.AddAsync(content);
        await _dbcontext.SaveChangesAsync();

        var createdContent = await _dbcontext.CourseContents
        .Include(c => c.Course)
        .FirstAsync(c => c.CourseContentId == content.CourseContentId);

        return MapToResponse(createdContent);
    }

    public async Task<CourseContentResponse?> UpdateModuleAsync(int courseContentId, int userId, UpdateCourseContentRequest request)
    {
        var content = await _dbcontext.CourseContents
            .Include(c => c.Course)
            .FirstOrDefaultAsync(c => c.CourseContentId == courseContentId);
        if (content == null)
        {
            return null;
        }

        // sirf wahi trainer edit kar sakta hai jo course pe assigned ho
        var isAssignedTrainer = await _dbcontext.CourseTrainers
            .AnyAsync(ct => ct.CourseId == content.CourseId && ct.TrainerId == userId);

        if (!isAssignedTrainer)
        {
            throw new InvalidOperationException("You are not assigned to this course.");
        }

        content.ModuleName = request.ModuleName;
        content.ContentType = request.ContentType;
        content.UrlOrPath = request.UrlOrPath;
        content.SortOrder = request.SortOrder;
        content.IsActive = request.IsActive;
        content.UpdatedAt = DateTime.UtcNow;
        content.UpdatedBy = userId;
        await _dbcontext.SaveChangesAsync();
        return MapToResponse(content);
    }

    public async Task<bool> DeleteModuleAsync(int courseContentId, int userId)
    {
        var content = await _dbcontext.CourseContents
            .FirstOrDefaultAsync(c => c.CourseContentId == courseContentId);
        if (content == null)
        {
            return false;
        }

        // sirf wahi trainer delete kar sakta hai jo course pe assigned ho
        var isAssignedTrainer = await _dbcontext.CourseTrainers
            .AnyAsync(ct => ct.CourseId == content.CourseId && ct.TrainerId == userId);

        if (!isAssignedTrainer)
        {
            throw new InvalidOperationException("You are not assigned to this course.");
        }

        content.IsActive = false;
        content.UpdatedAt = DateTime.UtcNow;
        content.UpdatedBy = userId;
        await _dbcontext.SaveChangesAsync();
        return true;
    }
    
    private static CourseContentResponse MapToResponse(CourseContent content, bool includeUrl = true)
    {
        return new CourseContentResponse
        {
            CourseContentId = content.CourseContentId,
            CourseId = content.CourseId,
            CourseTitle = content.Course?.Title ?? string.Empty,
            ModuleName = content.ModuleName,
            ContentType = content.ContentType,
            UrlOrPath = includeUrl ? content.UrlOrPath : string.Empty,
            SortOrder = content.SortOrder,
            IsActive = content.IsActive,
            CreatedAt = content.CreatedAt,
            UpdatedAt = content.UpdatedAt
        };
    }

}