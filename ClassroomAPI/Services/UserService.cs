using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomAPI.Models;
using ClassroomAPI.Repositories.Interfaces;
using ClassroomAPI.Services.Interfaces;

namespace ClassroomAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllUsersAsync();
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetUserByIdAsync(id);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _userRepository.GetUserByEmailAsync(email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            try
            {
                // Check if email already exists
                if (await _userRepository.EmailExistsAsync(user.Email))
                {
                    Console.WriteLine($"Registration failed: Email {user.Email} already in use");
                    throw new InvalidOperationException("Email already in use");
                }

                return await _userRepository.CreateUserAsync(user);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error creating user: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw; // Rethrow to be handled by the controller
            }
        }

        public async Task<bool> UpdateUserAsync(int id, User user)
        {
            if (id != user.UserID)
            {
                return false;
            }

            return await _userRepository.UpdateUserAsync(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteUserAsync(id);
        }

        public async Task<IEnumerable<Course>> GetTeacherCoursesAsync(int userId)
        {
            // First check if the user exists
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found");
            }

            return await _userRepository.GetTeacherCoursesAsync(userId);
        }

        public async Task<IEnumerable<Course>> GetStudentCoursesAsync(int userId)
        {
            // First check if the user exists
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found");
            }

            return await _userRepository.GetStudentCoursesAsync(userId);
        }

        public async Task<User> GetCurrentUserAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty");
            }

            var user = await _userRepository.GetUserByIdAsync(int.Parse(userId));
            if (user != null)
            {
                // Don't return the password in the response
                user.Password = null;
            }

            return user;
        }
    }
}
