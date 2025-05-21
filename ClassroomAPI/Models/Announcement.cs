using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class Announcement
    {
        [Key]
        public int AnnouncementID { get; set; }
        
        [Required]
        public int CourseID { get; set; }
        
        [Required]
        public int TeacherID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        [ForeignKey("CourseID")]
        public virtual Course Course { get; set; }
        
        [ForeignKey("TeacherID")]
        public virtual User Teacher { get; set; }
    }
}
