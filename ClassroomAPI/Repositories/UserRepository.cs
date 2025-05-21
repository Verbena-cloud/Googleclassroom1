using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ClassroomAPI.Data;
using ClassroomAPI.Models;
using ClassroomAPI.Repositories.Interfaces;

namespace ClassroomAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            // Set default values for any missing required fields
            user.ProfilePicture = string.IsNullOrEmpty(user.ProfilePicture) ? "default.jpg" : user.ProfilePicture;
            user.UserType = string.IsNullOrEmpty(user.UserType) ? "Student" : user.UserType;
            user.CreatedAt = DateTime.Now;
            user.UpdatedAt = DateTime.Now;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            _context.Entry(user).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await UserExistsAsync(user.UserID))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Course>> GetTeacherCoursesAsync(int userId)
        {
            return await _context.Courses
                .Where(c => c.TeacherID == userId)
                .Include(c => c.Teacher)
                .OrderBy(c => c.IsFolder ? 0 : 1) // Show folders first
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetStudentCoursesAsync(int userId)
        {
            return await _context.CourseEnrollments
                .Where(ce => ce.StudentID == userId)
                .Include(ce => ce.Course)
                .ThenInclude(c => c.Teacher)
                .Select(ce => ce.Course)
                .ToListAsync();
        }

        public async Task<bool> UserExistsAsync(int id)
        {
            return await _context.Users.AnyAsync(e => e.UserID == id);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}
