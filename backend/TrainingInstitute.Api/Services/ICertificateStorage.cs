/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Services;

public interface ICertificateStorage
{
    // Save the PDF bytes and return the relative path/key that should be
    // persisted on the CertificateIssued row.
    Task<string> SaveAsync(string fileName, byte[] content, CancellationToken cancellationToken = default);

    // Fetch the PDF bytes for the given file name. Returns null if missing.
    Task<byte[]?> ReadAsync(string fileName, CancellationToken cancellationToken = default);
}
