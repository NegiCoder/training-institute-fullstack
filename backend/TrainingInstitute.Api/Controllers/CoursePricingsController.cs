using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.CoursePricings;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class CoursePricingsController : ControllerBase
{

    private readonly ICoursePricingService _coursePricingService;

    public CoursePricingsController(ICoursePricingService coursePricingService)
    {
        _coursePricingService = coursePricingService;
    }


[HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourseId(int courseId)
    {
        var prices = await _coursePricingService.GetByCourseIdAsync(courseId);
        return Ok(prices);
    }


[HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var price = await _coursePricingService.GetByIdAsync(id);
        if (price == null)
        {
            return NotFound(
                new
                {
                    message = "Course pricing not found"
                }
            );
        }

        return Ok(price);

    }


    [HttpPost]
    [Authorize(Roles ="Admin")]


    public async Task<IActionResult> Create([FromBody] CreateCoursePricingRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized("user not authenticated");
        }
        try
        {
            var pricing = await _coursePricingService.CreateAsync(userId.Value, request);
            return Ok(pricing);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });

        }
    }


    [HttpPut("{coursePricingId}")]
[Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int coursePricingId, [FromBody] UpdateCoursePricingRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated." });
        }
        try
        {
            var pricing = await _coursePricingService.UpdateAsync(coursePricingId, userId.Value, request);
            if (pricing == null)
            {
                return NotFound(new { message = "Course pricing not found." });
            }
            return Ok(pricing);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }


    [HttpDelete("{coursePricingId}")]
[Authorize(Roles = "Admin")]

    public async Task<IActionResult> Delete(int coursePricingId)
    {
        var deleted = await _coursePricingService.DeleteAsync(coursePricingId);
        if (!deleted)
        {
            return NotFound(new { message = "Course pricing not found." });
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