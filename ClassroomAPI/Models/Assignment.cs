using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class Assignment
    {
        [Key]
        public int AssignmentID { get; set; }
        
        [Required]
        public int CourseID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public int? PointsPossible { get; set; }
        
        [Required]
        [StringLength(50)]
        public string AssignmentType { get; set; } = "Assignment"; // Assignment, Quiz, Exam, Material
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        [ForeignKey("CourseID")]
        public virtual Course Course { get; set; }
        
        public virtual ICollection<AssignmentMaterial> Materials { get; set; }
        public virtual ICollection<Submission> Submissions { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
    }
}
