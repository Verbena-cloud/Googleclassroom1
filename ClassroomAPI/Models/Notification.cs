using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomAPI.Models
{
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }
        
        [Required]
        public int UserID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        [Required]
        public string Message { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        [Required]
        [StringLength(50)]
        public string NotificationType { get; set; }
        
        public int? ReferenceID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        [ForeignKey("UserID")]
        public virtual User User { get; set; }
    }
}
