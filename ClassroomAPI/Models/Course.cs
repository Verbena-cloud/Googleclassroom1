using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class Course
    {
        [Key]
        public int CourseID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string CourseName { get; set; }
        
        [StringLength(20)]
        public string CourseCode { get; set; }
        
        public string Description { get; set; }
        
        [StringLength(50)]
        public string Section { get; set; }
        
        [StringLength(50)]
        public string Subject { get; set; }
        
        [StringLength(50)]
        public string Room { get; set; }
        
        [Required]
        public int TeacherID { get; set; }
        
        public bool IsArchived { get; set; } = false;
        
        // Folder-related properties
        public bool IsFolder { get; set; } = false;
        
        public int? ParentFolderId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        [ForeignKey("TeacherID")]
        public virtual User Teacher { get; set; }
        
        public virtual ICollection<CourseEnrollment> Enrollments { get; set; }
        public virtual ICollection<Assignment> Assignments { get; set; }
        public virtual ICollection<Announcement> Announcements { get; set; }
    }
}
