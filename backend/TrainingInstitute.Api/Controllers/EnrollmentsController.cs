/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.Enrollments;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentsController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    [HttpPost("me")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> CreateMyEnrollment([FromBody] CreateEnrollmentRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var enrollment = await _enrollmentService.CreateMyEnrollmentAsync(userId.Value, request);
            return Ok(enrollment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyEnrollments()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var enrollments = await _enrollmentService.GetMyEnrollmentsAsync(userId.Value);
        return Ok(enrollments);
    }

    [HttpGet("trainer/me")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> GetTrainerEnrollments()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var enrollments = await _enrollmentService.GetTrainerEnrollmentsAsync(userId.Value);
        return Ok(enrollments);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllEnrollments()
    {
        var enrollments = await _enrollmentService.GetAllEnrollmentsAsync();
        return Ok(enrollments);
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] EnrollmentSearchRequest request)
    {
        var result = await _enrollmentService.SearchAsync(request);
        return Ok(result);
    }

    [HttpGet("{courseEnrollmentId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetEnrollmentById(int courseEnrollmentId)
    {
        var enrollment = await _enrollmentService.GetEnrollmentByIdAsync(courseEnrollmentId);

        if (enrollment == null)
        {
            return NotFound(new { message = "Enrollment not found." });
        }

        return Ok(enrollment);
    }

    [HttpPut("{courseEnrollmentId:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(
        int courseEnrollmentId,
        [FromBody] UpdateEnrollmentStatusRequest request)
    {
        var adminUserId = GetCurrentUserId();

        if (adminUserId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var enrollment = await _enrollmentService.UpdateStatusAsync(
            courseEnrollmentId,
            adminUserId.Value,
            request);

        if (enrollment == null)
        {
            return NotFound(new { message = "Enrollment not found." });
        }

        return Ok(enrollment);
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