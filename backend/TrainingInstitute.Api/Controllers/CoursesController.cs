/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.Courses;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var courses = await _courseService.GetAllAsync(CanSeeDrafts());
        return Ok(courses);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] CourseSearchRequest request)
    {
        var result = await _courseService.SearchAsync(request, CanSeeDrafts());
        return Ok(result);
    }

    [HttpGet("{courseId}")]
    public async Task<IActionResult> GetById(int courseId)
    {
        var course = await _courseService.GetByIdAsync(courseId, CanSeeDrafts());

        if (course == null)
        {
            return NotFound(new { message = "Course not found." });
        }

        return Ok(course);
    }

    private bool CanSeeDrafts()
    {
        return User.IsInRole("Admin") || User.IsInRole("Trainer");
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var course = await _courseService.CreateAsync(userId.Value, request);
            return Ok(course);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{courseId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int courseId, [FromBody] UpdateCourseRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var course = await _courseService.UpdateAsync(courseId, userId.Value, request);

            if (course == null)
            {
                return NotFound(new { message = "Course not found." });
            }

            return Ok(course);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{courseId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int courseId)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var deleted = await _courseService.DeleteAsync(courseId, userId.Value);

        if (!deleted)
        {
            return NotFound(new { message = "Course not found." });
        }

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        return int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var userId)
            ? userId
            : null;
    }
}