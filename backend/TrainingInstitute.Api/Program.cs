using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using QuestPDF.Infrastructure;
using TrainingInstitute.Api.Configuration;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// DbContext yaha register kiya - SQL Server use karenge
builder.Services.AddDbContext<TrainingInstituteDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// services register
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ICourseCategoryService, CourseCategoryService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ICoursePricingService, CoursePricingService>();
builder.Services.AddScoped<ICourseContentService, CourseContentService>();
builder.Services.AddScoped<ICourseTrainerService, CourseTrainerService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IStudentModuleProgressService, StudentModuleProgressService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
// Jwt settings bind
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

QuestPDF.Settings.License = LicenseType.Community;

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));
builder.Services.Configure<CertificateStorageSettings>(builder.Configuration.GetSection("CertificateStorage"));
builder.Services.AddScoped<ICertificatePdfGenerator, CertificatePdfGenerator>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Pick certificate storage backend at startup based on configuration.
// If a blob connection string is supplied, use Azure Blob; otherwise fall
// back to the local-disk implementation (dev/demo).
var certStorageConnection = builder.Configuration["CertificateStorage:BlobConnectionString"];
if (!string.IsNullOrWhiteSpace(certStorageConnection))
{
    builder.Services.AddScoped<ICertificateStorage, BlobCertificateStorage>();
}
else
{
    builder.Services.AddScoped<ICertificateStorage, LocalCertificateStorage>();
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:5173"];

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// jwt config
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"]!;
var jwtIssuer = jwtSection["Issuer"]!;
var jwtAudience = jwtSection["Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Swagger + JWT Authorize button
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ExcelGens API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT token only (no 'Bearer ' prefix needed)",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();