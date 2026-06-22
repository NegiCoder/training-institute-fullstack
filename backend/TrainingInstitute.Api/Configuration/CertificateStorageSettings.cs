/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Configuration;

public class CertificateStorageSettings
{
    // Local-disk fallback (dev / when blob is not configured)
    public string Folder { get; set; } = string.Empty;

    public string PublicBaseUrl { get; set; } = string.Empty;

    // Azure Blob (preferred in production - survives container restarts)
    public string BlobConnectionString { get; set; } = string.Empty;

    public string ContainerName { get; set; } = "certificates";
}
