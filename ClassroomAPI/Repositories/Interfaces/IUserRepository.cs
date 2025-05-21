using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomAPI.Models;

namespace ClassroomAPI.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int id);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int id);
        Task<IEnumerable<Course>> GetTeacherCoursesAsync(int userId);
        Task<IEnumerable<Course>> GetStudentCoursesAsync(int userId);
        Task<bool> UserExistsAsync(int id);
        Task<bool> EmailExistsAsync(string email);
    }
}
