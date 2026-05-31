using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.CourseContents;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseContentsController : ControllerBase
{
    private readonly ICourseContentService _courseContentService;

    public CourseContentsController(ICourseContentService courseContentService)
    {
        _courseContentService = courseContentService;
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetAllModuleByCourseId(int courseId)
    {
        var modules = await _courseContentService.GetAllModuleByCourseIdAsync(
            courseId,
            GetCurrentUserId(),
            User.IsInRole("Admin"),
            User.IsInRole("Trainer"));
        return Ok(modules);
    }

    [HttpGet("{courseContentId}")]
    public async Task<IActionResult> GetModuleById(int courseContentId)
    {
        var module = await _courseContentService.GetModuleByIdAsync(
            courseContentId,
            GetCurrentUserId(),
            User.IsInRole("Admin"),
            User.IsInRole("Trainer"));

        if (module == null)
        {
            return NotFound(new { message = "Course module not found." });
        }

        return Ok(module);
    }

    [HttpPost]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> CreateModule([FromBody] CreateCourseContentRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var module = await _courseContentService.CreateModuleAsync(userId.Value, request);
            return Ok(module);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{courseContentId:int}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> UpdateModule(int courseContentId, [FromBody] UpdateCourseContentRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var module = await _courseContentService.UpdateModuleAsync(courseContentId, userId.Value, request);

            if (module == null)
            {
                return NotFound(new { message = "Course module not found." });
            }

            return Ok(module);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{courseContentId:int}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> DeleteModule(int courseContentId)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var deleted = await _courseContentService.DeleteModuleAsync(courseContentId, userId.Value);

            if (!deleted)
            {
                return NotFound(new { message = "Course module not found." });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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