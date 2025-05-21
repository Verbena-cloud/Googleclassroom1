using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class AssignmentMaterial
    {
        [Key]
        public int MaterialID { get; set; }
        
        [Required]
        public int AssignmentID { get; set; }
        
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
        [ForeignKey("AssignmentID")]
        public virtual Assignment Assignment { get; set; }
    }
}
