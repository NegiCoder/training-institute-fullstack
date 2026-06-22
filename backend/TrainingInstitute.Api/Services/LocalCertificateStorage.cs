/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using Microsoft.Extensions.Options;
using TrainingInstitute.Api.Configuration;

namespace TrainingInstitute.Api.Services;

// Used in local dev (no blob configured). Writes to wwwroot/certificates.
// Files are lost when the container/process is replaced.
public class LocalCertificateStorage : ICertificateStorage
{
    private readonly CertificateStorageSettings _settings;
    private readonly ILogger<LocalCertificateStorage> _logger;

    public LocalCertificateStorage(
        IOptions<CertificateStorageSettings> options,
        ILogger<LocalCertificateStorage> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    public async Task<string> SaveAsync(
        string fileName,
        byte[] content,
        CancellationToken cancellationToken = default)
    {
        var folder = string.IsNullOrWhiteSpace(_settings.Folder)
            ? "wwwroot/certificates"
            : _settings.Folder;

        Directory.CreateDirectory(folder);

        var fullPath = Path.Combine(folder, fileName);
        await File.WriteAllBytesAsync(fullPath, content, cancellationToken);

        var publicBase = string.IsNullOrWhiteSpace(_settings.PublicBaseUrl)
            ? "/certificates"
            : _settings.PublicBaseUrl.TrimEnd('/');

        _logger.LogInformation("Stored certificate {FileName} on local disk at {FullPath}", fileName, fullPath);

        return $"{publicBase}/{fileName}";
    }

    public async Task<byte[]?> ReadAsync(
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var folder = string.IsNullOrWhiteSpace(_settings.Folder)
            ? "wwwroot/certificates"
            : _settings.Folder;

        var fullPath = Path.Combine(folder, fileName);

        if (!File.Exists(fullPath))
        {
            return null;
        }

        return await File.ReadAllBytesAsync(fullPath, cancellationToken);
    }
}
