/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.CourseCategories;
using TrainingInstitute.Api.Models;

namespace TrainingInstitute.Api.Services;


public class CourseCategoryService : ICourseCategoryService
{

    private readonly TrainingInstituteDbContext _context;

    public CourseCategoryService(TrainingInstituteDbContext context)
    {
        _context = context;
    }



    public async Task<List<CourseCategoryResponse>> GetAllAsync()
    {
        var categories = await _context.CourseCategories.
            Where(categories => categories.IsActive).ToListAsync();

        return categories.Select(MapToResponse).ToList();
    }


    public async Task<CourseCategoryResponse?> GetByIdAsync(int courseCategoryId)
    {
        var category = await _context.CourseCategories.FirstOrDefaultAsync(c => c.CourseCategoryId == courseCategoryId && c.IsActive);

        if (category == null)
        {
            return null;
        }

        return MapToResponse(category);

    }


    public async Task<CourseCategoryResponse> CreateAsync(CreateCourseCategoryRequest request)

    {
        var checkIfAlreadyExist = await _context.CourseCategories.AnyAsync(c => c.Name.ToLower() == request.Name.ToLower());

        if (checkIfAlreadyExist == true)
        {
            throw new InvalidOperationException("Course category with the same name already exists.");
        }


        var category = new CourseCategory
        {
            Name = request.Name,
            IsActive = true,
        };


     await    _context.CourseCategories.AddAsync(category);
        await _context.SaveChangesAsync();

        return MapToResponse(category);

    }

    public async Task<CourseCategoryResponse?> UpdateAsync(int courseCategoryId, UpdateCourseCategoryRequest request)
    {
        var category = await _context.CourseCategories.FirstOrDefaultAsync(c => c.CourseCategoryId == courseCategoryId);

        if (category == null)
        {
            return null;
        }

        var nameAlreadyExists = await _context.CourseCategories
                  .AnyAsync(c => c.CourseCategoryId != courseCategoryId && c.Name.ToLower() == request.Name.ToLower());


        if (nameAlreadyExists)
        {
            throw new InvalidOperationException("Course category with the same name already exists.");
        }

        category.Name = request.Name;
        category.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        return MapToResponse(category);


    }


    public async Task<bool> DeleteAsync(int courseCategoryId)
    {
        var category = await _context.CourseCategories.FirstOrDefaultAsync(c => c.CourseCategoryId == courseCategoryId);

        if (category == null)
        {
            return false;
        }

        category.IsActive = false;
        await _context.SaveChangesAsync();
        return true;

    }

    public static CourseCategoryResponse MapToResponse(CourseCategory category)
    {
        return new CourseCategoryResponse
        {
            CourseCategoryId = category.CourseCategoryId,
            Name = category.Name,
            IsActive = category.IsActive
        };
    }





}