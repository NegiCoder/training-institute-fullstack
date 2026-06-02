using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Options;
using TrainingInstitute.Api.Configuration;

namespace TrainingInstitute.Api.Services;

// Used in production. Uploads/downloads from an Azure Storage Blob container.
// Survives container restarts and scale events.
public class BlobCertificateStorage : ICertificateStorage
{
    private readonly BlobContainerClient _containerClient;
    private readonly ILogger<BlobCertificateStorage> _logger;
    private bool _containerEnsured;

    public BlobCertificateStorage(
        IOptions<CertificateStorageSettings> options,
        ILogger<BlobCertificateStorage> logger)
    {
        var settings = options.Value;
        var containerName = string.IsNullOrWhiteSpace(settings.ContainerName)
            ? "certificates"
            : settings.ContainerName;

        _containerClient = new BlobContainerClient(settings.BlobConnectionString, containerName);
        _logger = logger;
    }

    public async Task<string> SaveAsync(
        string fileName,
        byte[] content,
        CancellationToken cancellationToken = default)
    {
        await EnsureContainerAsync(cancellationToken);

        var blob = _containerClient.GetBlobClient(fileName);

        using var stream = new MemoryStream(content);
        await blob.UploadAsync(
            stream,
            new BlobHttpHeaders { ContentType = "application/pdf" },
            cancellationToken: cancellationToken);

        _logger.LogInformation("Uploaded certificate {FileName} to blob container {Container}",
            fileName,
            _containerClient.Name);

        // We store the file name only; the download endpoint pulls it back
        // through this storage on demand. Avoids leaking the storage account
        // URL into the DB.
        return fileName;
    }

    public async Task<byte[]?> ReadAsync(
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var blob = _containerClient.GetBlobClient(fileName);

        try
        {
            var response = await blob.DownloadContentAsync(cancellationToken);
            return response.Value.Content.ToArray();
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            _logger.LogWarning("Certificate {FileName} not found in blob container {Container}",
                fileName,
                _containerClient.Name);
            return null;
        }
    }

    private async Task EnsureContainerAsync(CancellationToken cancellationToken)
    {
        if (_containerEnsured)
        {
            return;
        }

        await _containerClient.CreateIfNotExistsAsync(
            PublicAccessType.None,
            cancellationToken: cancellationToken);

        _containerEnsured = true;
    }
}
