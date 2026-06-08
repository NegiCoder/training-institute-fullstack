using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.Services;

namespace TrainingInstitute.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
// Reports ko Admin ke saath BusinessUser bhi dekh sakta hai.
// Baaki saare controllers Admin-only hai, isliye BusinessUser sirf yahi tak limited hai.
[Authorize(Roles = "Admin,BusinessUser")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var overview = await _reportService.GetOverviewAsync();
        return Ok(overview);
    }

    [HttpGet("course-performance")]
    public async Task<IActionResult> GetCoursePerformance()
    {
        var report = await _reportService.GetCoursePerformanceAsync();
        return Ok(report);
    }

    [HttpGet("top-courses")]
    public async Task<IActionResult> GetTopCourses(
        [FromQuery] string metric = "enrollments",
        [FromQuery] int limit = 10)
    {
        if (!IsSupportedTopCourseMetric(metric))
        {
            return BadRequest(new { message = "Metric must be either 'enrollments' or 'certificates'." });
        }

        var report = await _reportService.GetTopCoursesAsync(metric, limit);
        return Ok(report);
    }

    [HttpGet("enrollment-trend")]
    public async Task<IActionResult> GetEnrollmentTrend([FromQuery] int months = 12)
    {
        var report = await _reportService.GetEnrollmentTrendAsync(months);
        return Ok(report);
    }

    [HttpGet("trainer-performance")]
    public async Task<IActionResult> GetTrainerPerformance()
    {
        var report = await _reportService.GetTrainerPerformanceAsync();
        return Ok(report);
    }

    [HttpGet("category-performance")]
    public async Task<IActionResult> GetCategoryPerformance()
    {
        var report = await _reportService.GetCategoryPerformanceAsync();
        return Ok(report);
    }

    [HttpGet("student-engagement")]
    public async Task<IActionResult> GetStudentEngagement(
        [FromQuery] int idleDays = 60,
        [FromQuery] int limit = 10)
    {
        var report = await _reportService.GetStudentEngagementAsync(idleDays, limit);
        return Ok(report);
    }

    [HttpGet("course-performance.csv")]
    public async Task<IActionResult> DownloadCoursePerformanceCsv()
    {
        var csv = await _reportService.GetCoursePerformanceCsvAsync();
        return CsvFile(csv, "course-performance");
    }

    [HttpGet("top-courses.csv")]
    public async Task<IActionResult> DownloadTopCoursesCsv(
        [FromQuery] string metric = "enrollments",
        [FromQuery] int limit = 10)
    {
        if (!IsSupportedTopCourseMetric(metric))
        {
            return BadRequest(new { message = "Metric must be either 'enrollments' or 'certificates'." });
        }

        var csv = await _reportService.GetTopCoursesCsvAsync(metric, limit);
        return CsvFile(csv, $"top-courses-{metric.Trim().ToLowerInvariant()}");
    }

    [HttpGet("enrollment-trend.csv")]
    public async Task<IActionResult> DownloadEnrollmentTrendCsv([FromQuery] int months = 12)
    {
        var csv = await _reportService.GetEnrollmentTrendCsvAsync(months);
        return CsvFile(csv, $"enrollment-trend-{months}mo");
    }

    [HttpGet("trainer-performance.csv")]
    public async Task<IActionResult> DownloadTrainerPerformanceCsv()
    {
        var csv = await _reportService.GetTrainerPerformanceCsvAsync();
        return CsvFile(csv, "trainer-performance");
    }

    [HttpGet("category-performance.csv")]
    public async Task<IActionResult> DownloadCategoryPerformanceCsv()
    {
        var csv = await _reportService.GetCategoryPerformanceCsvAsync();
        return CsvFile(csv, "category-performance");
    }

    [HttpGet("student-engagement.csv")]
    public async Task<IActionResult> DownloadStudentEngagementCsv(
        [FromQuery] int idleDays = 60,
        [FromQuery] int limit = 10)
    {
        var csv = await _reportService.GetStudentEngagementCsvAsync(idleDays, limit);
        return CsvFile(csv, "student-engagement");
    }

    private FileContentResult CsvFile(string csv, string baseFileName)
    {
        var fileName = $"{baseFileName}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
        return File(Encoding.UTF8.GetBytes(csv), "text/csv", fileName);
    }

    private static bool IsSupportedTopCourseMetric(string metric)
    {
        var normalizedMetric = metric.Trim().ToLowerInvariant();
        return normalizedMetric is "enrollments" or "certificates";
    }
}
