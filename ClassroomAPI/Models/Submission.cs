using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class Submission
    {
        [Key]
        public int SubmissionID { get; set; }
        
        [Required]
        public int AssignmentID { get; set; }
        
        [Required]
        public int StudentID { get; set; }
        
        public string SubmissionText { get; set; }
        
        public decimal? Grade { get; set; }
        
        public string Feedback { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Submitted"; // Draft, Submitted, Graded, Late
        
        public DateTime SubmittedAt { get; set; } = DateTime.Now;
        
        public DateTime? GradedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("AssignmentID")]
        public virtual Assignment Assignment { get; set; }
        
        [ForeignKey("StudentID")]
        public virtual User Student { get; set; }
        
        public virtual ICollection<SubmissionFile> Files { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
    }
}
