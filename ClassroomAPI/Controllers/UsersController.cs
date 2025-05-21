using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ClassroomAPI.Data;
using ClassroomAPI.Models;

namespace ClassroomAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] User user)
        {
            try
            {
                Console.WriteLine($"Received registration request for email: {user.Email}");
                Console.WriteLine($"User data: FirstName={user.FirstName}, LastName={user.LastName}, UserType={user.UserType}");
                
                // Check if email already exists
                if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                {
                    Console.WriteLine($"Registration failed: Email {user.Email} already in use");
                    return BadRequest(new { message = "Email already in use" });
                }

                // Set default values for any missing required fields
                user.ProfilePicture = string.IsNullOrEmpty(user.ProfilePicture) ? "default.jpg" : user.ProfilePicture;
                user.UserType = string.IsNullOrEmpty(user.UserType) ? "Student" : user.UserType;
                user.CreatedAt = DateTime.Now;
                user.UpdatedAt = DateTime.Now;

                // In a real application, you would hash the password here
                _context.Users.Add(user);
                
                try {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"User {user.Email} successfully registered with ID: {user.UserID}");
                    
                    // Create a new object for the response to avoid null reference issues
                    var userResponse = new {
                        user.UserID,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        user.UserType,
                        user.ProfilePicture,
                        user.CreatedAt,
                        user.UpdatedAt
                    };
                    
                    return CreatedAtAction(nameof(GetUser), new { id = user.UserID }, userResponse);
                }
                catch (DbUpdateException dbEx)
                {
                    Console.WriteLine($"Database error while saving user: {dbEx.Message}");
                    Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                    return StatusCode(500, new { message = "Database error while creating user" });
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error creating user: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.UserID)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Users/Teacher/{id}/Courses
        [HttpGet("{id}/TeacherCourses")]
        public async Task<ActionResult<IEnumerable<Course>>> GetTeacherCourses(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Allow any user to access courses they created
            // Removed user type check to allow any user to create/view courses

            return await _context.Courses
                .Where(c => c.TeacherID == id)
                .Include(c => c.Teacher)
                .OrderBy(c => c.IsFolder ? 0 : 1) // Show folders first
                .ToListAsync();
        }

        // GET: api/Users/Student/{id}/Courses
        [HttpGet("{id}/StudentCourses")]
        public async Task<ActionResult<IEnumerable<Course>>> GetStudentCourses(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Allow any user to access courses they're enrolled in
            // Removed user type check to allow any user to join/view courses

            return await _context.CourseEnrollments
                .Where(ce => ce.StudentID == id)
                .Include(ce => ce.Course)
                .ThenInclude(c => c.Teacher)
                .Select(ce => ce.Course)
                .ToListAsync();
        }

        // GET: api/Users/current
        [HttpGet("current")]
        [Authorize]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));

            if (user == null)
            {
                return NotFound();
            }

            // Don't return the password in the response
            user.Password = null;

            return user;
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserID == id);
        }
    }
}
