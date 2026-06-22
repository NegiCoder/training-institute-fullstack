/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models;

namespace TrainingInstitute.Api.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}