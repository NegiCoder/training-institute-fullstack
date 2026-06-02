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
