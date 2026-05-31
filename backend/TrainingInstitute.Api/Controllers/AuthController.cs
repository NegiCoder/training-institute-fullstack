using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.Services;
using TrainingInstitute.Api.DTOs.Auth;
using TrainingInstitute.Api.Models.Enums;


namespace TrainingInstitute.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{

    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

[HttpPost("register")]

    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            request.Role = UserRole.Student;
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }

    }

[HttpPost("admin/create-trainer")]
[Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTrainer([FromBody] RegisterRequest request)
    {
        try
        {
            request.Role = UserRole.Trainer;
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

[HttpPost("admin/create-admin")]
[Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] RegisterRequest request)
    {
        try
        {
            request.Role = UserRole.Admin;
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }



[HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (response == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });


        }
        return Ok(response);

    }
}