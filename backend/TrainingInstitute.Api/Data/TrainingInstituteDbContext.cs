using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Models;

namespace TrainingInstitute.Api.Data;


// database ka main class - sare tables yaha se manage hote hai
public class TrainingInstituteDbContext : DbContext
{

    // ye constructor ASP.NET se options leta hai (connection string wagaira)
    public TrainingInstituteDbContext(DbContextOptions<TrainingInstituteDbContext> options) : base(options)
    {
    }


    // har DbSet = ek table in DB
    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }

    public DbSet<CourseCategory> CourseCategories { get; set; }

    public DbSet<Course> Courses { get; set; }

    public DbSet<CoursePricing> CoursePricings { get; set; }

    public DbSet<CourseEnrollment> CourseEnrollments { get; set; }

    public DbSet<CourseTrainer> CourseTrainers { get; set; }

    public DbSet<CourseContent> CourseContents { get; set; }

    public DbSet<StudentModuleProgress> StudentModuleProgress { get; set; }

    public DbSet<CertificateIssued> CertificateIssued { get; set; }

    public DbSet<AdminNotification> AdminNotifications { get; set; }




    // baad me yaha rules likhenge - unique email, relationships, delete behaviour wagaira

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //price warning fixing 
        modelBuilder.Entity<CoursePricing>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        // fixing cascade path error

        //course se -> coursContent->Studentmoduleprogress
        //course se->Courseenrollment->Studentmoduleprogress

        // this causing mutliple cascade path now we will have only one ! so error fixed! :)
        modelBuilder.Entity<StudentModuleProgress>()
            .HasOne(p => p.Content)
            .WithMany(c => c.ModuleProgressRows)
            .HasForeignKey(p => p.CourseContentId)
            .OnDelete(DeleteBehavior.Restrict);

    }



}
