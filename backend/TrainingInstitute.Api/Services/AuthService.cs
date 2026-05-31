

using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.Auth;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class AuthService : IAuthService
{

    private readonly TrainingInstituteDbContext _dbContext;
    private readonly ITokenService _tokenService;

    public AuthService(TrainingInstituteDbContext dbContext, ITokenService tokenService)
    {
        _dbContext = dbContext;
        _tokenService = tokenService;
    }


    // first we will write code for register logic 
    //steps  ->   1. check if email already exist in our db or not agr hui toh error throw kr denge
    //2.agr nhi hui exist to password ko hash krnge aur user entity bana k save kr denge db m
    //3 auth response send kro back to controller 

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {

        var emailExist = await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (emailExist)
        {
            throw new InvalidOperationException("Email already exists please try with different email ");
        }

        //password hash

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);


        //user entity banao and save kr lo

        User user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Users.Add(user);

        await _dbContext.SaveChangesAsync();


        //auth response send kr do back to controller

        return new AuthResponse
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Token = _tokenService.GenerateToken(user)
        };
    }




    // NOw we will write code for login logic

    //steps -> 1.serch user with email 
    // 2->if we cant find return error and if we find check if account is active or not 
    //3->compare password 
    //if everything find send response back 


    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {


        // serch user with email

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !user.IsActive)
        {
            return null;
        }

        var checkPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!checkPassword)
        {
            return null;
        }

        return new AuthResponse
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
             Token = _tokenService.GenerateToken(user)
        };


    }

    public async Task<List<TrainerListItem>> GetTrainersAsync()
    {
        return await _dbContext.Users
            .Where(u => u.Role == UserRole.Trainer && u.IsActive)
            .OrderBy(u => u.FullName)
            .Select(u => new TrainerListItem
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email
            })
            .ToListAsync();
    }
}