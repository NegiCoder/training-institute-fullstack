/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using System.ComponentModel.DataAnnotations;

namespace TrainingInstitute.Api.DTOs.Auth;


public class LoginRequest
{



    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;


    [Required]
     [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}