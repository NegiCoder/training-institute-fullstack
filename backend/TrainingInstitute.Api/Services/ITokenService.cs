using TrainingInstitute.Api.Models;

namespace TrainingInstitute.Api.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}