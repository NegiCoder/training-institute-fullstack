/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.Linq;
using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.CoursePricings;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class CoursePricingService : ICoursePricingService
{

    private readonly TrainingInstituteDbContext _dbContext;

    public CoursePricingService(TrainingInstituteDbContext dbContext)
    {
        _dbContext = dbContext;
    }



    public async Task<List<CoursePricingResponse>> GetByCourseIdAsync(int courseId)
    {
        var prices = await _dbContext.CoursePricings
            .Include(p => p.Course)
            .Where(p => p.CourseId == courseId)
            .OrderByDescending(p => p.Year)
            .ToListAsync();

        return prices.Select(MapToResponse).ToList();
    }


    public async Task<CoursePricingResponse?> GetByIdAsync(int coursePricingId)
    {
        var courseExist = await _dbContext.CoursePricings.Include(p => p.Course)
            .FirstOrDefaultAsync(p => p.CoursePricingId == coursePricingId);

        if (courseExist == null)
        {
            return null;
        }
        return MapToResponse(courseExist);
    }



    public async Task<CoursePricingResponse> CreateAsync(int userId, CreateCoursePricingRequest request)
    {
        var courseExist = await _dbContext.Courses.AnyAsync(p => p.CourseId == request.CourseId && p.Status != CourseStatus.Archived);

        if (courseExist == false)
        {
            throw new InvalidOperationException("Course not found or archived");
        }

var priceAlreadyExists = await _dbContext.CoursePricings
    .AnyAsync(p => p.CourseId == request.CourseId && p.Year == request.Year);
if (priceAlreadyExists)
{
    throw new InvalidOperationException("Price for this course and year already exists.");
}
        var pricing = new CoursePricing
        {
            CourseId = request.CourseId,
            Year = request.Year,
            Price = request.IsFree ? 0 : request.Price,
            IsFree = request.IsFree,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        await _dbContext.CoursePricings.AddAsync(pricing);
        await _dbContext.SaveChangesAsync();

        var createdPricing = await _dbContext.CoursePricings
        .Include(p => p.Course)
        .FirstOrDefaultAsync(p => p.CoursePricingId == pricing.CoursePricingId);
        if (createdPricing == null)
{
    throw new InvalidOperationException("Failed to retrieve created pricing");
}
        return MapToResponse(createdPricing);

    }


    public async Task<CoursePricingResponse?> UpdateAsync(int coursePricingId, int userId, UpdateCoursePricingRequest request)
    {
        var pricing = await _dbContext.CoursePricings
            .Include(p => p.Course)
            .FirstOrDefaultAsync(p => p.CoursePricingId == coursePricingId);
        if (pricing == null)
        {
            return null;
        }
        var priceAlreadyExists = await _dbContext.CoursePricings
            .AnyAsync(p =>
                p.CoursePricingId != coursePricingId &&
                p.CourseId == pricing.CourseId &&
                p.Year == request.Year);
        if (priceAlreadyExists)
        {
            throw new InvalidOperationException("Price for this course and year already exists.");
        }
        pricing.Year = request.Year;
        pricing.Price = request.IsFree ? 0 : request.Price;
        pricing.IsFree = request.IsFree;
        pricing.EffectiveFrom = request.EffectiveFrom;
        pricing.EffectiveTo = request.EffectiveTo;
        pricing.UpdatedAt = DateTime.UtcNow;
        pricing.UpdatedBy = userId;
        await _dbContext.SaveChangesAsync();
        return MapToResponse(pricing);
    }


    public async Task<bool> DeleteAsync(int coursePricingId)
    {
        var pricing = await _dbContext.CoursePricings
            .FirstOrDefaultAsync(p => p.CoursePricingId == coursePricingId);
        if (pricing == null)
        {
            return false;
        }
        _dbContext.CoursePricings.Remove(pricing);
        await _dbContext.SaveChangesAsync();
        return true;
    }
    
    private static CoursePricingResponse MapToResponse(CoursePricing pricing)
    {
        return new CoursePricingResponse
        {
            CoursePricingId = pricing.CoursePricingId,
            CourseId = pricing.CourseId,
            CourseTitle = pricing.Course?.Title ?? string.Empty,
            Year = pricing.Year,
            Price = pricing.Price,
            IsFree = pricing.IsFree,
            EffectiveFrom = pricing.EffectiveFrom,
            EffectiveTo = pricing.EffectiveTo,
            CreatedAt = pricing.CreatedAt,
            UpdatedAt = pricing.UpdatedAt
        };
    }

}