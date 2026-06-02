using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.Reports;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class ReportService : IReportService
{
    private readonly TrainingInstituteDbContext _context;

    public ReportService(TrainingInstituteDbContext context)
    {
        _context = context;
    }

    public async Task<ReportsOverviewResponse> GetOverviewAsync()
    {
        var totalEnrollments = await _context.CourseEnrollments.CountAsync();
        var completedEnrollments = await _context.CourseEnrollments
            .CountAsync(e => e.Status == EnrollmentStatus.Completed);

        return new ReportsOverviewResponse
        {
            TotalStudents = await _context.Students.CountAsync(),
            TotalTrainers = await _context.Users.CountAsync(u => u.Role == UserRole.Trainer),
            TotalCourses = await _context.Courses.CountAsync(c => c.Status != CourseStatus.Archived),
            PublishedCourses = await _context.Courses.CountAsync(c => c.Status == CourseStatus.Published),
            DraftCourses = await _context.Courses.CountAsync(c => c.Status == CourseStatus.Draft),
            TotalEnrollments = totalEnrollments,
            ActiveEnrollments = await _context.CourseEnrollments
                .CountAsync(e => e.Status == EnrollmentStatus.Assigned || e.Status == EnrollmentStatus.InProgress),
            CompletedEnrollments = completedEnrollments,
            TotalCertificates = await _context.CertificateIssued.CountAsync(),
            OverallCompletionRate = CalculateRate(completedEnrollments, totalEnrollments)
        };
    }

    public async Task<List<CoursePerformanceResponse>> GetCoursePerformanceAsync()
    {
        var courses = await _context.Courses
            .Include(c => c.Category)
            .Where(c => c.Status != CourseStatus.Archived)
            .OrderBy(c => c.Title)
            .ToListAsync();

        var courseIds = courses.Select(c => c.CourseId).ToList();
        var enrollments = await _context.CourseEnrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .Select(e => new
            {
                e.CourseId,
                e.Status,
                e.ProgressPercentage
            })
            .ToListAsync();

        var certificateCounts = await _context.CertificateIssued
            .Where(ci => ci.Enrollment != null && courseIds.Contains(ci.Enrollment.CourseId))
            .GroupBy(ci => ci.Enrollment!.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        var pricingMap = await GetLatestPricingMapAsync(courseIds);

        return courses
            .Select(course =>
            {
                var courseEnrollments = enrollments
                    .Where(e => e.CourseId == course.CourseId)
                    .ToList();

                var total = courseEnrollments.Count;
                var completed = courseEnrollments.Count(e => e.Status == EnrollmentStatus.Completed);
                var certificates = certificateCounts.GetValueOrDefault(course.CourseId);
                var averageProgress = total == 0
                    ? 0
                    : Math.Round((decimal)courseEnrollments.Average(e => e.ProgressPercentage), 2);
                var pricing = pricingMap.GetValueOrDefault(course.CourseId);

                return new CoursePerformanceResponse
                {
                    CourseId = course.CourseId,
                    CourseTitle = course.Title,
                    CategoryName = course.Category?.Name ?? string.Empty,
                    Status = course.Status.ToString(),
                    IsFree = pricing?.IsFree ?? false,
                    CurrentPrice = pricing?.Price,
                    TotalEnrollments = total,
                    AssignedCount = courseEnrollments.Count(e => e.Status == EnrollmentStatus.Assigned),
                    InProgressCount = courseEnrollments.Count(e => e.Status == EnrollmentStatus.InProgress),
                    CompletedCount = completed,
                    CancelledCount = courseEnrollments.Count(e => e.Status == EnrollmentStatus.Cancelled),
                    CertificatesIssued = certificates,
                    CompletionRate = CalculateRate(completed, total),
                    CertificateRate = CalculateRate(certificates, total),
                    AverageProgressPercentage = averageProgress
                };
            })
            .OrderByDescending(r => r.TotalEnrollments)
            .ThenBy(r => r.CourseTitle)
            .ToList();
    }

    public async Task<List<TopCourseResponse>> GetTopCoursesAsync(string metric, int limit)
    {
        var safeLimit = Math.Clamp(limit, 1, 25);
        var normalizedMetric = metric.Trim().ToLowerInvariant();

        if (normalizedMetric == "certificates")
        {
            return await _context.Courses
                .Include(c => c.Category)
                .Where(c => c.Status != CourseStatus.Archived)
                .Select(c => new TopCourseResponse
                {
                    CourseId = c.CourseId,
                    CourseTitle = c.Title,
                    CategoryName = c.Category == null ? string.Empty : c.Category.Name,
                    Count = _context.CertificateIssued.Count(ci =>
                        ci.Enrollment != null && ci.Enrollment.CourseId == c.CourseId)
                })
                .OrderByDescending(c => c.Count)
                .ThenBy(c => c.CourseTitle)
                .Take(safeLimit)
                .ToListAsync();
        }

        return await _context.Courses
            .Include(c => c.Category)
            .Where(c => c.Status != CourseStatus.Archived)
            .Select(c => new TopCourseResponse
            {
                CourseId = c.CourseId,
                CourseTitle = c.Title,
                CategoryName = c.Category == null ? string.Empty : c.Category.Name,
                Count = _context.CourseEnrollments.Count(e => e.CourseId == c.CourseId)
            })
            .OrderByDescending(c => c.Count)
            .ThenBy(c => c.CourseTitle)
            .Take(safeLimit)
            .ToListAsync();
    }

    public async Task<List<EnrollmentTrendPointResponse>> GetEnrollmentTrendAsync(int months)
    {
        var safeMonths = Math.Clamp(months, 1, 24);
        var now = DateTime.UtcNow;
        var firstMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-(safeMonths - 1));

        var grouped = await _context.CourseEnrollments
            .Where(e => e.CreatedAt >= firstMonth)
            .GroupBy(e => new { e.CreatedAt.Year, e.CreatedAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Count = g.Count()
            })
            .ToListAsync();

        var lookup = grouped.ToDictionary(
            x => $"{x.Year:D4}-{x.Month:D2}",
            x => x.Count);

        return Enumerable.Range(0, safeMonths)
            .Select(offset =>
            {
                var month = firstMonth.AddMonths(offset);
                var key = $"{month.Year:D4}-{month.Month:D2}";

                return new EnrollmentTrendPointResponse
                {
                    Year = month.Year,
                    Month = month.Month,
                    Label = month.ToString("MMM yyyy", CultureInfo.InvariantCulture),
                    EnrollmentCount = lookup.GetValueOrDefault(key)
                };
            })
            .ToList();
    }

    public async Task<List<TrainerPerformanceResponse>> GetTrainerPerformanceAsync()
    {
        var trainers = await _context.Users
            .Where(u => u.Role == UserRole.Trainer)
            .Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email
            })
            .ToListAsync();

        if (trainers.Count == 0)
        {
            return new List<TrainerPerformanceResponse>();
        }

        var trainerIds = trainers.Select(t => t.UserId).ToList();

        var trainerCourseLinks = await _context.CourseTrainers
            .Where(ct => trainerIds.Contains(ct.TrainerId))
            .Select(ct => new { ct.TrainerId, ct.CourseId })
            .ToListAsync();

        var allCourseIds = trainerCourseLinks
            .Select(l => l.CourseId)
            .Distinct()
            .ToList();

        var enrollments = allCourseIds.Count == 0
            ? new List<EnrollmentSlim>()
            : await _context.CourseEnrollments
                .Where(e => allCourseIds.Contains(e.CourseId))
                .Select(e => new EnrollmentSlim
                {
                    CourseEnrollmentId = e.CourseEnrollmentId,
                    CourseId = e.CourseId,
                    StudentId = e.StudentId,
                    Status = e.Status
                })
                .ToListAsync();

        var enrollmentIds = enrollments.Select(e => e.CourseEnrollmentId).ToList();
        var certEnrollmentIds = enrollmentIds.Count == 0
            ? new HashSet<int>()
            : (await _context.CertificateIssued
                .Where(c => enrollmentIds.Contains(c.CourseEnrollmentId))
                .Select(c => c.CourseEnrollmentId)
                .ToListAsync())
                .ToHashSet();

        return trainers
            .Select(t =>
            {
                var courseIds = trainerCourseLinks
                    .Where(l => l.TrainerId == t.UserId)
                    .Select(l => l.CourseId)
                    .Distinct()
                    .ToList();

                var trainerEnrollments = enrollments
                    .Where(e => courseIds.Contains(e.CourseId))
                    .ToList();

                var totalEnrollments = trainerEnrollments.Count;
                var completed = trainerEnrollments.Count(e => e.Status == EnrollmentStatus.Completed);
                var totalStudents = trainerEnrollments
                    .Select(e => e.StudentId)
                    .Distinct()
                    .Count();
                var completedStudents = trainerEnrollments
                    .Where(e => e.Status == EnrollmentStatus.Completed)
                    .Select(e => e.StudentId)
                    .Distinct()
                    .Count();
                var certificates = trainerEnrollments
                    .Count(e => certEnrollmentIds.Contains(e.CourseEnrollmentId));

                return new TrainerPerformanceResponse
                {
                    TrainerId = t.UserId,
                    TrainerName = t.FullName,
                    Email = t.Email,
                    CoursesAssigned = courseIds.Count,
                    TotalStudents = totalStudents,
                    CompletedStudents = completedStudents,
                    CertificatesIssued = certificates,
                    AverageCompletionRate = CalculateRate(completed, totalEnrollments)
                };
            })
            .OrderByDescending(t => t.TotalStudents)
            .ThenBy(t => t.TrainerName)
            .ToList();
    }

    public async Task<List<CategoryPerformanceResponse>> GetCategoryPerformanceAsync()
    {
        var categories = await _context.CourseCategories
            .Select(c => new { c.CourseCategoryId, c.Name })
            .ToListAsync();

        var courses = await _context.Courses
            .Where(c => c.Status != CourseStatus.Archived)
            .Select(c => new { c.CourseId, c.CourseCategoryId })
            .ToListAsync();

        var courseIds = courses.Select(c => c.CourseId).ToList();

        var enrollments = courseIds.Count == 0
            ? new List<EnrollmentSlim>()
            : await _context.CourseEnrollments
                .Where(e => courseIds.Contains(e.CourseId))
                .Select(e => new EnrollmentSlim
                {
                    CourseEnrollmentId = e.CourseEnrollmentId,
                    CourseId = e.CourseId,
                    StudentId = e.StudentId,
                    Status = e.Status
                })
                .ToListAsync();

        var enrollmentIds = enrollments.Select(e => e.CourseEnrollmentId).ToList();
        var certEnrollmentIds = enrollmentIds.Count == 0
            ? new HashSet<int>()
            : (await _context.CertificateIssued
                .Where(c => enrollmentIds.Contains(c.CourseEnrollmentId))
                .Select(c => c.CourseEnrollmentId)
                .ToListAsync())
                .ToHashSet();

        return categories
            .Select(cat =>
            {
                var catCourseIds = courses
                    .Where(c => c.CourseCategoryId == cat.CourseCategoryId)
                    .Select(c => c.CourseId)
                    .ToList();

                var catEnrollments = enrollments
                    .Where(e => catCourseIds.Contains(e.CourseId))
                    .ToList();

                var total = catEnrollments.Count;
                var completed = catEnrollments.Count(e => e.Status == EnrollmentStatus.Completed);
                var certs = catEnrollments
                    .Count(e => certEnrollmentIds.Contains(e.CourseEnrollmentId));

                return new CategoryPerformanceResponse
                {
                    CategoryId = cat.CourseCategoryId,
                    CategoryName = cat.Name,
                    TotalCourses = catCourseIds.Count,
                    TotalEnrollments = total,
                    CompletedEnrollments = completed,
                    CertificatesIssued = certs,
                    AverageCompletionRate = CalculateRate(completed, total)
                };
            })
            .OrderByDescending(c => c.TotalEnrollments)
            .ThenBy(c => c.CategoryName)
            .ToList();
    }

    public async Task<StudentEngagementResponse> GetStudentEngagementAsync(
        int idleDays = 30,
        int limit = 10)
    {
        var safeLimit = Math.Clamp(limit, 1, 50);
        var safeIdleDays = Math.Clamp(idleDays, 1, 365);
        var now = DateTime.UtcNow;
        var cutoff = now.AddDays(-safeIdleDays);

        var topByCertificates = await _context.CertificateIssued
            .Where(c => c.Enrollment != null
                && c.Enrollment.Student != null
                && c.Enrollment.Student.User != null)
            .GroupBy(c => new
            {
                c.Enrollment!.StudentId,
                c.Enrollment.Student!.FirstName,
                c.Enrollment.Student.LastName,
                Email = c.Enrollment.Student.User!.Email
            })
            .Select(g => new TopStudentResponse
            {
                StudentId = g.Key.StudentId,
                StudentName = (g.Key.FirstName + " " + g.Key.LastName).Trim(),
                Email = g.Key.Email,
                CertificatesEarned = g.Count(),
                CompletedCourses = g
                    .Select(c => c.Enrollment!.CourseId)
                    .Distinct()
                    .Count()
            })
            .OrderByDescending(t => t.CertificatesEarned)
            .ThenBy(t => t.StudentName)
            .Take(safeLimit)
            .ToListAsync();

        var studentSummaries = await _context.Students
            .Where(s => s.User != null)
            .Select(s => new
            {
                s.StudentId,
                s.FirstName,
                s.LastName,
                Email = s.User!.Email,
                LastEnrollmentAt = (DateTime?)s.Enrollments
                    .Max(e => (DateTime?)e.CreatedAt),
                TotalEnrollments = s.Enrollments.Count()
            })
            .ToListAsync();

        var idleStudents = studentSummaries
            .Where(s => s.LastEnrollmentAt == null || s.LastEnrollmentAt < cutoff)
            .OrderBy(s => s.LastEnrollmentAt ?? DateTime.MinValue)
            .ThenBy(s => s.FirstName)
            .Take(safeLimit)
            .Select(s => new IdleStudentResponse
            {
                StudentId = s.StudentId,
                StudentName = ((s.FirstName ?? string.Empty) + " " + (s.LastName ?? string.Empty)).Trim(),
                Email = s.Email,
                LastEnrollmentAt = s.LastEnrollmentAt,
                DaysSinceLastEnrollment = s.LastEnrollmentAt.HasValue
                    ? Math.Max(0, (int)(now - s.LastEnrollmentAt.Value).TotalDays)
                    : 0,
                TotalEnrollments = s.TotalEnrollments
            })
            .ToList();

        return new StudentEngagementResponse
        {
            TopByCertificates = topByCertificates,
            IdleStudents = idleStudents
        };
    }

    public async Task<string> GetCoursePerformanceCsvAsync()
    {
        var rows = await GetCoursePerformanceAsync();
        var builder = new StringBuilder();
        builder.AppendLine("Course,Category,Status,Price Type,Current Price,Total Enrollments,Assigned,In Progress,Completed,Cancelled,Certificates Issued,Completion Rate,Certificate Rate,Average Progress");

        foreach (var row in rows)
        {
            builder.AppendLine(string.Join(",",
                Csv(row.CourseTitle),
                Csv(row.CategoryName),
                Csv(row.Status),
                Csv(row.IsFree ? "Free" : "Paid"),
                row.CurrentPrice?.ToString("0.00", CultureInfo.InvariantCulture) ?? string.Empty,
                row.TotalEnrollments,
                row.AssignedCount,
                row.InProgressCount,
                row.CompletedCount,
                row.CancelledCount,
                row.CertificatesIssued,
                row.CompletionRate.ToString("0.##", CultureInfo.InvariantCulture),
                row.CertificateRate.ToString("0.##", CultureInfo.InvariantCulture),
                row.AverageProgressPercentage.ToString("0.##", CultureInfo.InvariantCulture)));
        }

        return builder.ToString();
    }

    public async Task<string> GetTopCoursesCsvAsync(string metric, int limit)
    {
        var rows = await GetTopCoursesAsync(metric, limit);
        var header = metric.Trim().ToLowerInvariant() == "certificates"
            ? "Rank,Course,Category,Certificates"
            : "Rank,Course,Category,Enrollments";

        var builder = new StringBuilder();
        builder.AppendLine(header);

        var rank = 1;
        foreach (var row in rows)
        {
            builder.AppendLine(string.Join(",",
                rank++,
                Csv(row.CourseTitle),
                Csv(row.CategoryName),
                row.Count));
        }

        return builder.ToString();
    }

    public async Task<string> GetEnrollmentTrendCsvAsync(int months)
    {
        var rows = await GetEnrollmentTrendAsync(months);
        var builder = new StringBuilder();
        builder.AppendLine("Year,Month,Label,Enrollment Count");

        foreach (var row in rows)
        {
            builder.AppendLine(string.Join(",",
                row.Year,
                row.Month,
                Csv(row.Label),
                row.EnrollmentCount));
        }

        return builder.ToString();
    }

    public async Task<string> GetTrainerPerformanceCsvAsync()
    {
        var rows = await GetTrainerPerformanceAsync();
        var builder = new StringBuilder();
        builder.AppendLine("Trainer,Email,Courses Assigned,Total Students,Completed Students,Certificates Issued,Completion Rate");

        foreach (var row in rows)
        {
            builder.AppendLine(string.Join(",",
                Csv(row.TrainerName),
                Csv(row.Email),
                row.CoursesAssigned,
                row.TotalStudents,
                row.CompletedStudents,
                row.CertificatesIssued,
                row.AverageCompletionRate.ToString("0.##", CultureInfo.InvariantCulture)));
        }

        return builder.ToString();
    }

    public async Task<string> GetCategoryPerformanceCsvAsync()
    {
        var rows = await GetCategoryPerformanceAsync();
        var builder = new StringBuilder();
        builder.AppendLine("Category,Total Courses,Total Enrollments,Completed Enrollments,Certificates Issued,Completion Rate");

        foreach (var row in rows)
        {
            builder.AppendLine(string.Join(",",
                Csv(row.CategoryName),
                row.TotalCourses,
                row.TotalEnrollments,
                row.CompletedEnrollments,
                row.CertificatesIssued,
                row.AverageCompletionRate.ToString("0.##", CultureInfo.InvariantCulture)));
        }

        return builder.ToString();
    }

    public async Task<string> GetStudentEngagementCsvAsync(int idleDays = 30, int limit = 10)
    {
        var data = await GetStudentEngagementAsync(idleDays, limit);
        var builder = new StringBuilder();

        builder.AppendLine("# Top Students by Certificates");
        builder.AppendLine("Student,Email,Certificates,Completed Courses");
        foreach (var row in data.TopByCertificates)
        {
            builder.AppendLine(string.Join(",",
                Csv(row.StudentName),
                Csv(row.Email),
                row.CertificatesEarned,
                row.CompletedCourses));
        }

        builder.AppendLine();
        builder.AppendLine($"# Idle Students (no enrollment in last {Math.Clamp(idleDays, 1, 365)} days)");
        builder.AppendLine("Student,Email,Last Enrollment,Days Idle,Total Enrollments");
        foreach (var row in data.IdleStudents)
        {
            builder.AppendLine(string.Join(",",
                Csv(row.StudentName),
                Csv(row.Email),
                Csv(row.LastEnrollmentAt?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? "Never"),
                row.LastEnrollmentAt.HasValue
                    ? row.DaysSinceLastEnrollment.ToString(CultureInfo.InvariantCulture)
                    : "-",
                row.TotalEnrollments));
        }

        return builder.ToString();
    }

    private async Task<Dictionary<int, CoursePricingSnapshot>> GetLatestPricingMapAsync(
        IEnumerable<int> courseIds)
    {
        var ids = courseIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return new Dictionary<int, CoursePricingSnapshot>();
        }

        var pricingRows = await _context.CoursePricings
            .Where(p => ids.Contains(p.CourseId))
            .OrderByDescending(p => p.Year)
            .ToListAsync();

        return pricingRows
            .GroupBy(p => p.CourseId)
            .ToDictionary(
                g => g.Key,
                g =>
                {
                    var latest = g.First();
                    return new CoursePricingSnapshot(latest.IsFree, latest.Price);
                });
    }

    private static decimal CalculateRate(int part, int total)
    {
        return total == 0 ? 0 : Math.Round(part * 100m / total, 2);
    }

    private static string Csv(string value)
    {
        var escaped = value.Replace("\"", "\"\"");
        return $"\"{escaped}\"";
    }

    private sealed record CoursePricingSnapshot(bool IsFree, decimal Price);

    private sealed class EnrollmentSlim
    {
        public int CourseEnrollmentId { get; set; }
        public int CourseId { get; set; }
        public int StudentId { get; set; }
        public EnrollmentStatus Status { get; set; }
    }
}
