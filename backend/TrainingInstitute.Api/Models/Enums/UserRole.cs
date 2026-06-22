/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

namespace TrainingInstitute.Api.Models.Enums;

// account kiska hai - 4 type ke users
// BusinessUser sirf reports dashboard dekh sakta hai, baaki kuch nahi
public enum UserRole
{
    Student = 1,
    Trainer = 2,
    Admin = 3,
    BusinessUser = 4
}
