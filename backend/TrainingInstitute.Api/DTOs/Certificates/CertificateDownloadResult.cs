/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.DTOs.Certificates;

public class CertificateDownloadResult
{
    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public byte[] Content { get; set; } = Array.Empty<byte>();
}