using Microsoft.AspNetCore.Mvc;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "Healthy",
            service = "ExcelGens API",
            checkedAt = DateTime.UtcNow
        });
    }
}
