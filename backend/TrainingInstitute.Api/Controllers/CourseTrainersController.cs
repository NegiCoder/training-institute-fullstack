/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.CourseTrainers;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseTrainersController : ControllerBase
{
    private readonly ICourseTrainerService _courseTrainerService;

    public CourseTrainersController(ICourseTrainerService courseTrainerService)
    {
        _courseTrainerService = courseTrainerService;
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetTrainersByCourseId(int courseId)
    {
        var trainers = await _courseTrainerService.GetTrainersByCourseIdAsync(courseId);
        return Ok(trainers);
    }

    [HttpGet("trainer/{trainerId}")]
    public async Task<IActionResult> GetCoursesByTrainerId(int trainerId)
    {
        var courses = await _courseTrainerService.GetCoursesByTrainerIdAsync(trainerId);
        return Ok(courses);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignTrainer([FromBody] AssignTrainerRequest request)
    {
        try
        {
            var assignment = await _courseTrainerService.AssignTrainerAsync(request);
            return Ok(assignment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{courseTrainerId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveTrainer(int courseTrainerId)
    {
        var removed = await _courseTrainerService.RemoveTrainerAsync(courseTrainerId);

        if (!removed)
        {
            return NotFound(new { message = "Trainer assignment not found." });
        }

        return NoContent();
    }
}