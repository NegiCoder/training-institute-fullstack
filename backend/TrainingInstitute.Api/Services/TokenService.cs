/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TrainingInstitute.Api.Configuration;
using TrainingInstitute.Api.Models;

namespace  TrainingInstitute.Api.Services;


public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    public TokenService(IOptions<JwtSettings> jwtOptions)
    {
        _jwtSettings = jwtOptions.Value;
    }


    public string GenerateToken(User user)
    {

        // step 1 - claim banao - these info stored inside jwt

  var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Name, user.FullName),
    new Claim(ClaimTypes.Role, user.Role.ToString()),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
};

        // step 2-secret key use kro 

        var keyBytes = Encoding.UTF8.GetBytes(_jwtSettings.Key);
        var securityKey = new SymmetricSecurityKey(keyBytes);
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);


        //step 2-actual tolen banao

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpireInMinutes),
            signingCredentials: signingCredentials
        );


        //step 4- token object convert to strin this string shold be sent to frontnend

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return tokenString;

    

        
    }
    
}

