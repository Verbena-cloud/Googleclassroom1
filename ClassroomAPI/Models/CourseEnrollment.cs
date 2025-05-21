using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class CourseEnrollment
    {
        [Key]
        public int EnrollmentID { get; set; }
        
        [Required]
        public int CourseID { get; set; }
        
        [Required]
        public int StudentID { get; set; }
        
        public DateTime EnrollmentDate { get; set; } = DateTime.Now;
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Active"; // Active, Inactive, Pending
        
        // Navigation properties
        [ForeignKey("CourseID")]
        public virtual Course Course { get; set; }
        
        [ForeignKey("StudentID")]
        public virtual User Student { get; set; }
    }
}
