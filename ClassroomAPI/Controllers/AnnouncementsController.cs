using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassroomAPI.Data;
using ClassroomAPI.Models;

namespace ClassroomAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Announcements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetAnnouncements()
        {
            return await _context.Announcements
                .Include(a => a.Course)
                .Include(a => a.Teacher)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Announcements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Announcement>> GetAnnouncement(int id)
        {
            var announcement = await _context.Announcements
                .Include(a => a.Course)
                .Include(a => a.Teacher)
                .FirstOrDefaultAsync(a => a.AnnouncementID == id);

            if (announcement == null)
            {
                return NotFound();
            }

            return announcement;
        }

        // POST: api/Announcements
        [HttpPost]
        public async Task<ActionResult<Announcement>> CreateAnnouncement(Announcement announcement)
        {
            // Verify course exists
            var course = await _context.Courses.FindAsync(announcement.CourseID);
            if (course == null)
            {
                return BadRequest("Invalid course ID");
            }

            // Verify teacher exists
            var teacher = await _context.Users.FindAsync(announcement.TeacherID);
            if (teacher == null || teacher.UserType != "Teacher")
            {
                return BadRequest("Invalid teacher ID");
            }

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            // Create notifications for all students enrolled in the course
            var enrolledStudents = await _context.CourseEnrollments
                .Where(ce => ce.CourseID == announcement.CourseID && ce.Status == "Active")
                .Select(ce => ce.StudentID)
                .ToListAsync();

            foreach (var studentId in enrolledStudents)
            {
                var notification = new Notification
                {
                    UserID = studentId,
                    Title = "New Announcement",
                    Message = $"A new announcement has been posted in {course.CourseName}: {announcement.Title}",
                    NotificationType = "Announcement",
                    ReferenceID = announcement.AnnouncementID,
                    CreatedAt = DateTime.Now
                };

                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.AnnouncementID }, announcement);
        }

        // PUT: api/Announcements/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnnouncement(int id, Announcement announcement)
        {
            if (id != announcement.AnnouncementID)
            {
                return BadRequest();
            }

            _context.Entry(announcement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AnnouncementExists(id))
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

        // DELETE: api/Announcements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound();
            }

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Announcements/Course/5
        [HttpGet("Course/{courseId}")]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetCourseAnnouncements(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            return await _context.Announcements
                .Where(a => a.CourseID == courseId)
                .Include(a => a.Teacher)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Announcements/Teacher/5
        [HttpGet("Teacher/{teacherId}")]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetTeacherAnnouncements(int teacherId)
        {
            var teacher = await _context.Users.FindAsync(teacherId);
            if (teacher == null || teacher.UserType != "Teacher")
            {
                return BadRequest("Invalid teacher ID");
            }

            return await _context.Announcements
                .Where(a => a.TeacherID == teacherId)
                .Include(a => a.Course)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        private bool AnnouncementExists(int id)
        {
            return _context.Announcements.Any(e => e.AnnouncementID == id);
        }
    }
}
