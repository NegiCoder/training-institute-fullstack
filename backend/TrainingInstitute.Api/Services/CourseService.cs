/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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

    public async Task<List<CourseResponse>> GetAllAsync(bool includeDrafts = false)
    {
        var query = _context.Courses
            .Include(c => c.Category)
            .AsQueryable();

        query = includeDrafts
            ? query.Where(c => c.Status != CourseStatus.Archived)
            : query.Where(c => c.Status == CourseStatus.Published);

        var courses = await query.ToListAsync();
        var pricingMap = await GetLatestPricingMapAsync(courses.Select(c => c.CourseId));

        return courses.Select(c => MapToResponse(c, pricingMap.GetValueOrDefault(c.CourseId))).ToList();
    }

    public async Task<CourseResponse?> GetByIdAsync(int courseId, bool includeDrafts = false)
    {
        var query = _context.Courses
            .Include(c => c.Category)
            .Where(c => c.CourseId == courseId);

        query = includeDrafts
            ? query.Where(c => c.Status != CourseStatus.Archived)
            : query.Where(c => c.Status == CourseStatus.Published);

        var course = await query.FirstOrDefaultAsync();

        if (course == null)
        {
            return null;
        }

        var pricingMap = await GetLatestPricingMapAsync(new[] { course.CourseId });
        return MapToResponse(course, pricingMap.GetValueOrDefault(course.CourseId));
    }

    public async Task<PagedResponse<CourseResponse>> SearchAsync(CourseSearchRequest request, bool includeDrafts = false)
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

        if (includeDrafts)
        {
            query = query.Where(c => c.Status != CourseStatus.Archived);
        }
        else
        {
            // Public/student callers only see Published courses.
            // If the caller explicitly asked for a non-Published status, treat it as no result.
            if (request.Status.HasValue && request.Status.Value != CourseStatus.Published)
            {
                query = query.Where(c => false);
            }
            else
            {
                query = query.Where(c => c.Status == CourseStatus.Published);
            }
        }

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

        if (request.IsFeatured.HasValue)
        {
            query = query.Where(c => c.IsFeatured == request.IsFeatured.Value);
        }

        if (request.IsFree.HasValue)
        {
            var latestPricingQuery = _context.CoursePricings
                .GroupBy(p => p.CourseId)
                .Select(g => new
                {
                    CourseId = g.Key,
                    IsFree = g.OrderByDescending(p => p.Year).First().IsFree
                });

            if (request.IsFree.Value)
            {
                query = query.Where(c =>
                    latestPricingQuery.Any(p => p.CourseId == c.CourseId && p.IsFree));
            }
            else
            {
                query = query.Where(c =>
                    !latestPricingQuery.Any(p => p.CourseId == c.CourseId && p.IsFree));
            }
        }

        var totalCount = await query.CountAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var courses = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var pricingMap = await GetLatestPricingMapAsync(courses.Select(c => c.CourseId));

        return new PagedResponse<CourseResponse>
        {
            Items = courses.Select(c => MapToResponse(c, pricingMap.GetValueOrDefault(c.CourseId))).ToList(),
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

        var pricingMap = await GetLatestPricingMapAsync(new[] { createdCourse.CourseId });
        return MapToResponse(createdCourse, pricingMap.GetValueOrDefault(createdCourse.CourseId));
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
        course.IsFeatured = request.IsFeatured;
        course.FeaturedByUserId = request.IsFeatured ? userId : null;
        course.UpdatedAt = DateTime.UtcNow;
        course.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        var updatedCourse = await _context.Courses
            .Include(c => c.Category)
            .FirstAsync(c => c.CourseId == courseId);

        var pricingMap = await GetLatestPricingMapAsync(new[] { updatedCourse.CourseId });
        return MapToResponse(updatedCourse, pricingMap.GetValueOrDefault(updatedCourse.CourseId));
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

    private async Task<Dictionary<int, CoursePricingSnapshot>> GetLatestPricingMapAsync(
        IEnumerable<int> courseIds)
    {
        var ids = courseIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return new Dictionary<int, CoursePricingSnapshot>();
        }

        var pricingRows = await _context.CoursePricings
            .Where(p => ids.Contains(p.CourseId))
            .OrderByDescending(p => p.Year)
            .ToListAsync();

        return pricingRows
            .GroupBy(p => p.CourseId)
            .ToDictionary(
                g => g.Key,
                g =>
                {
                    var latest = g.First();
                    return new CoursePricingSnapshot(latest.IsFree, latest.Price);
                });
    }

    private static CourseResponse MapToResponse(
        Course course,
        CoursePricingSnapshot? pricing = null)
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
            IsFeatured = course.IsFeatured,
            IsFree = pricing?.IsFree ?? false,
            CurrentPrice = pricing?.Price,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt
        };
    }

    private sealed record CoursePricingSnapshot(bool IsFree, decimal Price);
}