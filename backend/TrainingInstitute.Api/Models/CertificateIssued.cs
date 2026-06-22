/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Models;

// ek enrollment ke liye certificate - CourseEnrollmentId unique, ek hi baar banegi
public class CertificateIssued
{
    public int CertificateIssuedId { get; set; }

    public int CourseEnrollmentId { get; set; }

    public CourseEnrollment? Enrollment { get; set; }

    public string CertificateNumber { get; set; } = string.Empty;

    public DateTime IssuedAt { get; set; }

    // PDF ka path - disk pe ya blob storage me
    public string PdfPath { get; set; } = string.Empty;

    public CertificateEmailStatus EmailStatus { get; set; }

    public DateTime? EmailSentAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }
}
