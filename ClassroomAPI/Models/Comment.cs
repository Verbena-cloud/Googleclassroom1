using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class Comment
    {
        [Key]
        public int CommentID { get; set; }
        
        public int? AssignmentID { get; set; }
        
        public int? SubmissionID { get; set; }
        
        [Required]
        public int UserID { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        [ForeignKey("AssignmentID")]
        public virtual Assignment Assignment { get; set; }
        
        [ForeignKey("SubmissionID")]
        public virtual Submission Submission { get; set; }
        
        [ForeignKey("UserID")]
        public virtual User User { get; set; }
    }
}
