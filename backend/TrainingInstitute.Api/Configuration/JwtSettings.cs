/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Configuration;

public class JwtSettings
{

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; }= string.Empty;
    public string Audience { get; set; }=string.Empty;
    public int ExpireInMinutes { get; set; }
 
}