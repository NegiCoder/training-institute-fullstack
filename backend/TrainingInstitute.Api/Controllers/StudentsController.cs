/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.Students;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/students")]
[Authorize]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpPost("me")]
    public async Task<IActionResult> CreateMyProfile([FromBody] CreateStudentProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "user not authenticated" });
        }

        try
        {
            var response = await _studentService.CreateMyProfileAsync(userId.Value, request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "user not authenticated" });
        }

        var response = await _studentService.GetMyProfileAsync(userId.Value);

        if (response == null)
        {
            return NotFound(new { message = "user profile not found" });
        }

        return Ok(response);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateStudentProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "user not authenticated" });
        }

        var response = await _studentService.UpdateMyProfileAsync(userId.Value, request);

        if (response == null)
        {
            return NotFound(new { message = "user profile not found" });
        }

        return Ok(response);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllStudents()
    {
        var students = await _studentService.GetAllStudentsAsync();
        return Ok(students);
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] StudentSearchRequest request)
    {
        var result = await _studentService.SearchAsync(request);
        return Ok(result);
    }

    [HttpGet("{studentId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStudentById(int studentId)
    {
        var student = await _studentService.GetStudentByIdAsync(studentId);

        if (student == null)
        {
            return NotFound(new { message = "student not found" });
        }

        return Ok(student);
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