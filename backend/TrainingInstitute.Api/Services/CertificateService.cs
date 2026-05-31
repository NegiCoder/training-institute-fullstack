using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TrainingInstitute.Api.Configuration;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.Certificates;
using TrainingInstitute.Api.DTOs.Common;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class CertificateService : ICertificateService
{
    private readonly TrainingInstituteDbContext _context;
    private readonly ICertificatePdfGenerator _pdfGenerator;
    private readonly IEmailService _emailService;
    private readonly CertificateStorageSettings _storageSettings;

    public CertificateService(
        TrainingInstituteDbContext context,
        ICertificatePdfGenerator pdfGenerator,
        IEmailService emailService,
        IOptions<CertificateStorageSettings> storageOptions)
    {
        _context = context;
        _pdfGenerator = pdfGenerator;
        _emailService = emailService;
        _storageSettings = storageOptions.Value;
    }

    public async Task<CertificateResponse> IssueCertificateAsync(int adminUserId, IssueCertificateRequest request)
    {
        var enrollment = await _context.CourseEnrollments
            .Include(e => e.Student)
                .ThenInclude(s => s!.User)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.CourseEnrollmentId == request.CourseEnrollmentId);

        if (enrollment == null)
        {
            throw new InvalidOperationException("Enrollment not found.");
        }

        if (enrollment.Student == null)
        {
            throw new InvalidOperationException("Student not found for this enrollment.");
        }

        if (enrollment.Course == null)
        {
            throw new InvalidOperationException("Course not found for this enrollment.");
        }

        var certificateAlreadyExists = await _context.CertificateIssued
            .AnyAsync(c => c.CourseEnrollmentId == request.CourseEnrollmentId);

        if (certificateAlreadyExists)
        {
            throw new InvalidOperationException("Certificate already issued for this enrollment.");
        }

        enrollment.Status = EnrollmentStatus.Completed;
        enrollment.ProgressPercentage = 100;
        enrollment.CompletedAt = DateTime.UtcNow;
        enrollment.CompletedByAdminId = adminUserId;
        enrollment.UpdatedAt = DateTime.UtcNow;
        enrollment.UpdatedBy = adminUserId;

        var certificateNumber = GenerateCertificateNumber(enrollment.CourseEnrollmentId);
        var studentName = $"{enrollment.Student.FirstName} {enrollment.Student.LastName}";
        var courseTitle = enrollment.Course.Title;

        var pdfBytes = _pdfGenerator.GenerateCertificatePdf(
            studentName,
            courseTitle,
            certificateNumber,
            DateTime.UtcNow);


        var fileName = $"{certificateNumber}.pdf";
        var fullPath = Path.Combine(_storageSettings.Folder, fileName);
        await File.WriteAllBytesAsync(fullPath, pdfBytes);

        var publicPath = $"{_storageSettings.PublicBaseUrl.TrimEnd('/')}/{fileName}";

        var certificate = new CertificateIssued
        {
            CourseEnrollmentId = enrollment.CourseEnrollmentId,
            CertificateNumber = certificateNumber,
            IssuedAt = DateTime.UtcNow,
            PdfPath = publicPath,
            EmailStatus = CertificateEmailStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = adminUserId
        };

        _context.CertificateIssued.Add(certificate);
        await _context.SaveChangesAsync();

        var studentEmail = enrollment.Student.User?.Email;

        if (!string.IsNullOrWhiteSpace(studentEmail))
        {
            try
            {
                await _emailService.SendCertificateEmailAsync(
                    studentEmail,
                    studentName,
                    courseTitle,
                    certificateNumber,
                    pdfBytes);

                certificate.EmailStatus = CertificateEmailStatus.Sent;
                certificate.EmailSentAt = DateTime.UtcNow;
            }
            catch
            {
                certificate.EmailStatus = CertificateEmailStatus.Failed;
            }

            await _context.SaveChangesAsync();
        }

        var createdCertificate = await _context.CertificateIssued
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Course)
            .FirstAsync(c => c.CertificateIssuedId == certificate.CertificateIssuedId);

        return MapToResponse(createdCertificate);
    }

    public async Task<CertificateResponse?> GetByEnrollmentIdAsync(int courseEnrollmentId)
    {
        var certificate = await _context.CertificateIssued
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Course)
            .FirstOrDefaultAsync(c => c.CourseEnrollmentId == courseEnrollmentId);

        if (certificate == null)
        {
            return null;
        }

        return MapToResponse(certificate);
    }

    public async Task<CertificateResponse?> GetByIdAsync(int certificateIssuedId)
    {
        var certificate = await _context.CertificateIssued
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Course)
            .FirstOrDefaultAsync(c => c.CertificateIssuedId == certificateIssuedId);

        if (certificate == null)
        {
            return null;
        }

        return MapToResponse(certificate);
    }

    public async Task<List<CertificateResponse>> GetAllAsync()
    {
        var certificates = await _context.CertificateIssued
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Course)
            .ToListAsync();

        return certificates.Select(MapToResponse).ToList();
    }

    public async Task<List<CertificateResponse>> GetMyCertificatesAsync(int userId)
    {
        var certificates = await _context.CertificateIssued
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Course)
            .Where(c =>
                c.Enrollment != null &&
                c.Enrollment.Student != null &&
                c.Enrollment.Student.UserId == userId)
            .OrderByDescending(c => c.IssuedAt)
            .ToListAsync();

        return certificates.Select(MapToResponse).ToList();
    }

    private static string GenerateCertificateNumber(int courseEnrollmentId)
    {
        return $"CERT-{DateTime.UtcNow:yyyyMMdd}-{courseEnrollmentId}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }

    private static CertificateResponse MapToResponse(CertificateIssued certificate)
    {
        var enrollment = certificate.Enrollment;
        var student = enrollment?.Student;
        var course = enrollment?.Course;

        return new CertificateResponse
        {
            CertificateIssuedId = certificate.CertificateIssuedId,
            CourseEnrollmentId = certificate.CourseEnrollmentId,
            CertificateNumber = certificate.CertificateNumber,
            StudentName = student == null
                ? string.Empty
                : $"{student.FirstName} {student.LastName}",
            CourseTitle = course?.Title ?? string.Empty,
            IssuedAt = certificate.IssuedAt,
            PdfPath = certificate.PdfPath,
            EmailStatus = certificate.EmailStatus,
            EmailSentAt = certificate.EmailSentAt,
            CreatedAt = certificate.CreatedAt
        };
    }
    public async Task<CertificateDownloadResult?> GetCertificateFileAsync(int certificateIssuedId, int userId, bool isAdmin)
    {
        var certificate = await _context.CertificateIssued
            .Include(c => c.Enrollment)
                .ThenInclude(e => e!.Student)
            .FirstOrDefaultAsync(c => c.CertificateIssuedId == certificateIssuedId);

        if (certificate == null)
        {
            return null;
        }

        if (!isAdmin)
        {
            var ownerUserId = certificate.Enrollment?.Student?.UserId;

            if (ownerUserId == null || ownerUserId != userId)
            {
                throw new UnauthorizedAccessException("You can only download your own certificate.");
            }
        }

        var fileName = $"{certificate.CertificateNumber}.pdf";
        var fullPath = Path.Combine(_storageSettings.Folder, fileName);

        if (!File.Exists(fullPath))
        {
            return null;
        }

        var bytes = await File.ReadAllBytesAsync(fullPath);

        return new CertificateDownloadResult
        {
            FileName = fileName,
            ContentType = "application/pdf",
            Content = bytes
        };
    }
public async Task<PagedResponse<CertificateResponse>> SearchAsync(CertificateSearchRequest request)
{
    var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
    var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

    if (pageSize > 50)
    {
        pageSize = 50;
    }

    var query = _context.CertificateIssued
        .Include(c => c.Enrollment)
            .ThenInclude(e => e!.Student)
        .Include(c => c.Enrollment)
            .ThenInclude(e => e!.Course)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(request.SearchTerm))
    {
        var searchTerm = request.SearchTerm.Trim();

        query = query.Where(c =>
            EF.Functions.Like(c.CertificateNumber, $"%{searchTerm}%") ||
            (c.Enrollment != null &&
             c.Enrollment.Student != null &&
             EF.Functions.Like(c.Enrollment.Student.FirstName + " " + c.Enrollment.Student.LastName, $"%{searchTerm}%")) ||
            (c.Enrollment != null &&
             c.Enrollment.Course != null &&
             EF.Functions.Like(c.Enrollment.Course.Title, $"%{searchTerm}%")));
    }

    if (request.CourseEnrollmentId.HasValue)
    {
        query = query.Where(c => c.CourseEnrollmentId == request.CourseEnrollmentId.Value);
    }

    if (request.StudentId.HasValue)
    {
        query = query.Where(c =>
            c.Enrollment != null &&
            c.Enrollment.StudentId == request.StudentId.Value);
    }

    if (request.CourseId.HasValue)
    {
        query = query.Where(c =>
            c.Enrollment != null &&
            c.Enrollment.CourseId == request.CourseId.Value);
    }

    if (request.EmailStatus.HasValue)
    {
        query = query.Where(c => c.EmailStatus == request.EmailStatus.Value);
    }

    if (request.IssuedFrom.HasValue)
    {
        query = query.Where(c => c.IssuedAt >= request.IssuedFrom.Value);
    }

    if (request.IssuedTo.HasValue)
    {
        query = query.Where(c => c.IssuedAt <= request.IssuedTo.Value);
    }

    var totalCount = await query.CountAsync();

    var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

    var certificates = await query
        .OrderByDescending(c => c.IssuedAt)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return new PagedResponse<CertificateResponse>
    {
        Items = certificates.Select(MapToResponse).ToList(),
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalCount = totalCount,
        TotalPages = totalPages,
        HasPreviousPage = pageNumber > 1,
        HasNextPage = pageNumber < totalPages
    };
}
}