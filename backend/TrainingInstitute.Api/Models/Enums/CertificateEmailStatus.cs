/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Models.Enums;

// cert ka email gaya ya nahi - retry / support ke liye
public enum CertificateEmailStatus
{
    Pending = 1,
    Sent = 2,
    Failed = 3
}
