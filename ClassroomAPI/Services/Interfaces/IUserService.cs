using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomAPI.Models;

namespace ClassroomAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int id);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task<bool> UpdateUserAsync(int id, User user);
        Task<bool> DeleteUserAsync(int id);
        Task<IEnumerable<Course>> GetTeacherCoursesAsync(int userId);
        Task<IEnumerable<Course>> GetStudentCoursesAsync(int userId);
        Task<User> GetCurrentUserAsync(string userId);
    }
}
