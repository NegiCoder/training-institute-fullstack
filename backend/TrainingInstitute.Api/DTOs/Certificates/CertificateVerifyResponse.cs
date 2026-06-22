/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.Certificates;

// Public verify endpoint ka response.
// IMPORTANT: yaha sirf minimum public-safe fields rakhe hai.
// Email/phone jaise sensitive cheeze yaha kabhi expose mat karna.
public class CertificateVerifyResponse
{
    public bool IsValid { get; set; }

    public string CertificateNumber { get; set; } = string.Empty;

    public string? StudentName { get; set; }

    public string? CourseTitle { get; set; }

    public DateTime? IssuedAt { get; set; }

    public string IssuedBy { get; set; } = "ExcelGens";
}
