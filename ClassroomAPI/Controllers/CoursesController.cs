using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassroomAPI.Data;
using ClassroomAPI.Models;
using ClassroomAPI.Services;

namespace ClassroomAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;

        public CoursesController(ApplicationDbContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        // GET: api/Courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            return await _context.Courses
                .Include(c => c.Teacher)
                .ToListAsync();
        }

        // GET: api/Courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync(c => c.CourseID == id);

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        // POST: api/Courses
        [HttpPost]
        public async Task<ActionResult<Course>> CreateCourse(Course course)
        {
            // Verify user exists - any user can create a course now
            var user = await _context.Users.FindAsync(course.TeacherID);
            if (user == null)
            {
                return BadRequest("Invalid user ID");
            }

            // Only generate a course code for actual courses (not folders)
            if (!course.IsFolder && string.IsNullOrEmpty(course.CourseCode))
            {
                course.CourseCode = GenerateUniqueClassCode();
            }

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            try
            {
                // Create a folder for the course after it's saved to the database
                string folderPath = await _fileService.CreateCourseFolderAsync(course.CourseID, course.CourseName);
                
                // You could store the folder path in the course object if needed
                // course.FolderPath = folderPath;
                // await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the course creation
                // Consider adding a more robust error handling strategy
                Console.WriteLine($"Error creating course folder: {ex.Message}");
            }

            return CreatedAtAction(nameof(GetCourse), new { id = course.CourseID }, course);
        }

        // Helper method to generate a unique class code
        private string GenerateUniqueClassCode()
        {
            // Generate a random 6-character alphanumeric code
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            string code;
            
            do
            {
                code = new string(Enumerable.Repeat(chars, 6)
                    .Select(s => s[random.Next(s.Length)]).ToArray());
            } 
            while (_context.Courses.Any(c => c.CourseCode == code));
            
            return code;
        }

        // PUT: api/Courses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, Course course)
        {
            if (id != course.CourseID)
            {
                return BadRequest();
            }

            _context.Entry(course).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
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

        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Courses/5/Enroll
        [HttpPost("{id}/Enroll")]
        public async Task<IActionResult> EnrollStudent(int id, [FromBody] EnrollmentRequest request)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            var student = await _context.Users.FindAsync(request.StudentID);
            if (student == null)
            {
                return BadRequest("Invalid user ID");
            }

            // Check if already enrolled
            var existingEnrollment = await _context.CourseEnrollments
                .FirstOrDefaultAsync(ce => ce.CourseID == id && ce.StudentID == request.StudentID);

            if (existingEnrollment != null)
            {
                // Update status if already enrolled
                existingEnrollment.Status = request.Status ?? "Active";
                _context.Entry(existingEnrollment).State = EntityState.Modified;
            }
            else
            {
                // Create new enrollment
                var enrollment = new CourseEnrollment
                {
                    CourseID = id,
                    StudentID = request.StudentID,
                    Status = request.Status ?? "Active"
                };
                _context.CourseEnrollments.Add(enrollment);
            }

            await _context.SaveChangesAsync();
            return Ok("Student enrolled successfully");
        }

        // GET: api/Courses/5/Students
        [HttpGet("{id}/Students")]
        public async Task<ActionResult<IEnumerable<User>>> GetCourseStudents(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            var students = await _context.CourseEnrollments
                .Where(ce => ce.CourseID == id)
                .Include(ce => ce.Student)
                .Select(ce => ce.Student)
                .ToListAsync();

            return students;
        }

        // GET: api/Courses/5/Assignments
        [HttpGet("{id}/Assignments")]
        public async Task<ActionResult<IEnumerable<Assignment>>> GetCourseAssignments(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            var assignments = await _context.Assignments
                .Where(a => a.CourseID == id)
                .ToListAsync();

            return assignments;
        }

        // GET: api/Courses/5/Announcements
        [HttpGet("{id}/Announcements")]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetCourseAnnouncements(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            var announcements = await _context.Announcements
                .Where(a => a.CourseID == id)
                .Include(a => a.Teacher)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return announcements;
        }

        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.CourseID == id);
        }
        
        // POST: api/Courses/JoinByCode/{code}
        [HttpPost("JoinByCode/{code}")]
        public async Task<IActionResult> JoinCourseByCode(string code, [FromBody] EnrollmentRequest request)
        {
            // Find course by code
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseCode == code);
                
            if (course == null)
            {
                return NotFound("Course not found. Please check the class code and try again.");
            }
            
            var user = await _context.Users.FindAsync(request.StudentID);
            if (user == null)
            {
                return BadRequest("Invalid user ID");
            }
            
            // Check if already enrolled
            var existingEnrollment = await _context.CourseEnrollments
                .FirstOrDefaultAsync(ce => ce.CourseID == course.CourseID && ce.StudentID == request.StudentID);
                
            if (existingEnrollment != null)
            {
                // Update status if already enrolled
                existingEnrollment.Status = request.Status ?? "Active";
                _context.Entry(existingEnrollment).State = EntityState.Modified;
            }
            else
            {
                // Create new enrollment
                var enrollment = new CourseEnrollment
                {
                    CourseID = course.CourseID,
                    StudentID = request.StudentID,
                    Status = request.Status ?? "Active"
                };
                _context.CourseEnrollments.Add(enrollment);
            }
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Successfully joined the class", courseId = course.CourseID });
        }
    }

    public class EnrollmentRequest
    {
        public int StudentID { get; set; }
        public string Status { get; set; }
    }
}
