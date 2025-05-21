using System.ComponentModel.DataAnnotations;

namespace ClassroomAPI.Models
{
    public class RegisterModel
    {
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Password { get; set; }
        
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }
        
        [Required]
        [StringLength(50)]
        public string LastName { get; set; }
        
        [Required]
        [StringLength(20)]
        public string UserType { get; set; } // Teacher, Student, Admin
    }
}
