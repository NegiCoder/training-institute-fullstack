/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.Certificates;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificateService;

    public CertificatesController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    [HttpPost("issue")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> IssueCertificate([FromBody] IssueCertificateRequest request)
    {
        var adminUserId = GetCurrentUserId();

        if (adminUserId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        try
        {
            var certificate = await _certificateService.IssueCertificateAsync(adminUserId.Value, request);
            return Ok(certificate);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var certificates = await _certificateService.GetAllAsync();
        return Ok(certificates);
    }

    [HttpGet("me")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyCertificates()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var certificates = await _certificateService.GetMyCertificatesAsync(userId.Value);
        return Ok(certificates);
    }

    [HttpGet("{certificateIssuedId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int certificateIssuedId)
    {
        var certificate = await _certificateService.GetByIdAsync(certificateIssuedId);

        if (certificate == null)
        {
            return NotFound(new { message = "Certificate not found." });
        }

        return Ok(certificate);
    }

    [HttpGet("enrollment/{courseEnrollmentId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByEnrollmentId(int courseEnrollmentId)
    {
        var certificate = await _certificateService.GetByEnrollmentIdAsync(courseEnrollmentId);

        if (certificate == null)
        {
            return NotFound(new { message = "Certificate not found for this enrollment." });
        }

        return Ok(certificate);
    }

    // Public verify endpoint - intentionally [AllowAnonymous].
    // Recruiter ya koi bhi outsider yaha aake certificate ka authenticity check kar sake.
    // Sirf minimum data return hota hai (service layer dekho).
    [HttpGet("verify/{certificateNumber}")]
    [AllowAnonymous]
    public async Task<IActionResult> Verify(string certificateNumber)
    {
        var result = await _certificateService.VerifyAsync(certificateNumber);
        // Hum hamesha 200 OK bhejte hai. isValid flag se frontend decide karega
        // ki "Verified" card dikhana hai ya "Not Found" card.
        return Ok(result);
    }

    [HttpGet("download/{certificateIssuedId:int}")]
    public async Task<IActionResult> Download(int certificateIssuedId)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var isAdmin = User.IsInRole("Admin");

        try
        {
            var result = await _certificateService.GetCertificateFileAsync(
                certificateIssuedId, userId.Value, isAdmin);

            if (result == null)
            {
                return NotFound(new { message = "Certificate file not found." });
            }

            return File(result.Content, result.ContentType, result.FileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }
    [HttpGet("search")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> Search([FromQuery] CertificateSearchRequest request)
{
    var result = await _certificateService.SearchAsync(request);
    return Ok(result);
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