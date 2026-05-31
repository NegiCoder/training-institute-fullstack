using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.Common;
using TrainingInstitute.Api.DTOs.Courses;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class CourseService : ICourseService
{
    private readonly TrainingInstituteDbContext _context;

    public CourseService(TrainingInstituteDbContext context)
    {
        _context = context;
    }

    public async Task<List<CourseResponse>> GetAllAsync()
    {
        var courses = await _context.Courses
            .Include(c => c.Category)
            .Where(c => c.Status != CourseStatus.Archived)
            .ToListAsync();

        return courses.Select(MapToResponse).ToList();
    }

    public async Task<CourseResponse?> GetByIdAsync(int courseId)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c =>
                c.CourseId == courseId &&
                c.Status != CourseStatus.Archived);

        if (course == null)
        {
            return null;
        }

        return MapToResponse(course);
    }

    public async Task<PagedResponse<CourseResponse>> SearchAsync(CourseSearchRequest request)
    {
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var query = _context.Courses
            .Include(c => c.Category)
            .AsQueryable();

        query = query.Where(c => c.Status != CourseStatus.Archived);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.Trim();

            query = query.Where(c =>
                EF.Functions.Like(c.Title, $"%{searchTerm}%") ||
                (c.Description != null &&
                 EF.Functions.Like(c.Description, $"%{searchTerm}%")));
        }

        if (request.CourseCategoryId.HasValue)
        {
            query = query.Where(c => c.CourseCategoryId == request.CourseCategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Level))
        {
            query = query.Where(c => c.Level == request.Level);
        }

        if (!string.IsNullOrWhiteSpace(request.Mode))
        {
            query = query.Where(c => c.Mode == request.Mode);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(c => c.Status == request.Status.Value);
        }

        if (request.IsOpenAccess.HasValue)
        {
            query = query.Where(c => c.IsOpenAccess == request.IsOpenAccess.Value);
        }

        if (request.IsFeatured.HasValue)
        {
            query = query.Where(c => c.IsFeatured == request.IsFeatured.Value);
        }

        var totalCount = await query.CountAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var courses = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<CourseResponse>
        {
            Items = courses.Select(MapToResponse).ToList(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = pageNumber > 1,
            HasNextPage = pageNumber < totalPages
        };
    }

    public async Task<CourseResponse> CreateAsync(int userId, CreateCourseRequest request)
    {
        var categoryExists = await _context.CourseCategories
            .AnyAsync(c => c.CourseCategoryId == request.CourseCategoryId && c.IsActive);

        if (!categoryExists)
        {
            throw new InvalidOperationException("Course category not found or inactive.");
        }

        var course = new Course
        {
            CourseCategoryId = request.CourseCategoryId,
            Title = request.Title,
            Description = request.Description,
            Level = request.Level,
            Mode = request.Mode,
            Duration = request.Duration,
            Status = request.Status,
            IsOpenAccess = request.IsOpenAccess,
            IsFeatured = request.IsFeatured,
            FeaturedByUserId = request.IsFeatured ? userId : null,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        var createdCourse = await _context.Courses
            .Include(c => c.Category)
            .FirstAsync(c => c.CourseId == course.CourseId);

        return MapToResponse(createdCourse);
    }

    public async Task<CourseResponse?> UpdateAsync(int courseId, int userId, UpdateCourseRequest request)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null)
        {
            return null;
        }

        var categoryExists = await _context.CourseCategories
            .AnyAsync(c => c.CourseCategoryId == request.CourseCategoryId && c.IsActive);

        if (!categoryExists)
        {
            throw new InvalidOperationException("Course category not found or inactive.");
        }

        course.CourseCategoryId = request.CourseCategoryId;
        course.Title = request.Title;
        course.Description = request.Description;
        course.Level = request.Level;
        course.Mode = request.Mode;
        course.Duration = request.Duration;
        course.Status = request.Status;
        course.IsOpenAccess = request.IsOpenAccess;
        course.IsFeatured = request.IsFeatured;
        course.FeaturedByUserId = request.IsFeatured ? userId : null;
        course.UpdatedAt = DateTime.UtcNow;
        course.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        var updatedCourse = await _context.Courses
            .Include(c => c.Category)
            .FirstAsync(c => c.CourseId == courseId);

        return MapToResponse(updatedCourse);
    }

    public async Task<bool> DeleteAsync(int courseId, int userId)
    {
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null)
        {
            return false;
        }

        course.Status = CourseStatus.Archived;
        course.UpdatedAt = DateTime.UtcNow;
        course.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        return true;
    }

    private static CourseResponse MapToResponse(Course course)
    {
        return new CourseResponse
        {
            CourseId = course.CourseId,
            CourseCategoryId = course.CourseCategoryId,
            CategoryName = course.Category?.Name ?? string.Empty,
            Title = course.Title,
            Description = course.Description,
            Level = course.Level,
            Mode = course.Mode,
            Duration = course.Duration,
            Status = course.Status,
            IsOpenAccess = course.IsOpenAccess,
            IsFeatured = course.IsFeatured,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt
        };
    }
}