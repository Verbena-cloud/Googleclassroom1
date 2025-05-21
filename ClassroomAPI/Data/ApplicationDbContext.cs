using ClassroomAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ClassroomAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseEnrollment> CourseEnrollments { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<AssignmentMaterial> AssignmentMaterials { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<SubmissionFile> SubmissionFiles { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Course>()
                .HasIndex(c => c.CourseCode)
                .IsUnique();

            // Configure one-to-many relationships
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Teacher)
                .WithMany(u => u.TeacherCourses)
                .HasForeignKey(c => c.TeacherID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CourseEnrollment>()
                .HasOne(ce => ce.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(ce => ce.CourseID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseEnrollment>()
                .HasOne(ce => ce.Student)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(ce => ce.StudentID)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure unique constraint for course enrollment
            modelBuilder.Entity<CourseEnrollment>()
                .HasIndex(ce => new { ce.CourseID, ce.StudentID })
                .IsUnique();

            // Configure check constraints
            modelBuilder.Entity<User>()
                .HasCheckConstraint("CK_Users_UserType", "UserType IN ('Teacher', 'Student', 'Admin')");

            modelBuilder.Entity<CourseEnrollment>()
                .HasCheckConstraint("CK_CourseEnrollments_Status", "Status IN ('Active', 'Inactive', 'Pending')");

            modelBuilder.Entity<Assignment>()
                .HasCheckConstraint("CK_Assignments_AssignmentType", "AssignmentType IN ('Assignment', 'Quiz', 'Exam', 'Material')");

            modelBuilder.Entity<Submission>()
                .HasCheckConstraint("CK_Submissions_Status", "Status IN ('Draft', 'Submitted', 'Graded', 'Late')");

            // Configure unique constraint for student submission
            modelBuilder.Entity<Submission>()
                .HasIndex(s => new { s.AssignmentID, s.StudentID })
                .IsUnique();

            // Configure the Comment entity to require either AssignmentID or SubmissionID
            modelBuilder.Entity<Comment>()
                .HasCheckConstraint("CK_Comments_Target", 
                    "([AssignmentID] IS NOT NULL OR [SubmissionID] IS NOT NULL)");
        }
    }
}
