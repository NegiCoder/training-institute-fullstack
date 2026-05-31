using TrainingInstitute.Api.DTOs.Auth;

namespace TrainingInstitute.Api.Services;


public interface IAuthService
{
Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
}
    