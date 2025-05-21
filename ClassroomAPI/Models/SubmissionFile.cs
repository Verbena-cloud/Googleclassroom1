using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class SubmissionFile
    {
        [Key]
        public int FileID { get; set; }
        
        [Required]
        public int SubmissionID { get; set; }
        
        [Required]
        [StringLength(255)]
        public string FileName { get; set; }
        
        [Required]
        [StringLength(50)]
        public string FileType { get; set; }
        
        [Required]
        [StringLength(255)]
        public string FileURL { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        [ForeignKey("SubmissionID")]
        public virtual Submission Submission { get; set; }
    }
}
