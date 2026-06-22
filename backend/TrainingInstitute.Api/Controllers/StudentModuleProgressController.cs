/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.StudentModuleProgress;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class StudentModuleProgressController : ControllerBase
{
    private readonly IStudentModuleProgressService _studentModuleProgressService;

    public StudentModuleProgressController(IStudentModuleProgressService studentModuleProgressService)
    {
        _studentModuleProgressService = studentModuleProgressService;
    }

    [HttpPost("complete")]
    public async Task<IActionResult> MarkModuleComplete([FromBody] MarkModuleCompleteRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var progress = await _studentModuleProgressService.MarkModuleCompleteAsync(userId.Value, request);
            return Ok(progress);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("enrollment/{courseEnrollmentId:int}")]
    public async Task<IActionResult> GetProgressByEnrollmentId(int courseEnrollmentId)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var progress = await _studentModuleProgressService.GetProgressByEnrollmentIdAsync(userId.Value, courseEnrollmentId);
            return Ok(progress);
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