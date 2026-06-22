/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Configuration;

// Yaha frontend ka public URL store hota hai jisse hum QR code banate hai.
// Local me default localhost rakha hai - production me Azure env var
// se override karenge (CertificateVerify__FrontendBaseUrl).
public class CertificateVerifySettings
{
    public string FrontendBaseUrl { get; set; } = string.Empty;
}
