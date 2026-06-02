namespace TrainingInstitute.Api.Configuration;

// Yaha frontend ka public URL store hota hai jisse hum QR code banate hai.
// Local me default localhost rakha hai - production me Azure env var
// se override karenge (CertificateVerify__FrontendBaseUrl).
public class CertificateVerifySettings
{
    public string FrontendBaseUrl { get; set; } = string.Empty;
}
