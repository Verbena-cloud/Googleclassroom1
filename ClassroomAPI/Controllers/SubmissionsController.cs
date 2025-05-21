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
    public class SubmissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubmissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Submissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissions()
        {
            return await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .ToListAsync();
        }

        // GET: api/Submissions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Submission>> GetSubmission(int id)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .FirstOrDefaultAsync(s => s.SubmissionID == id);

            if (submission == null)
            {
                return NotFound();
            }

            return submission;
        }

        // PUT: api/Submissions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubmission(int id, Submission submission)
        {
            if (id != submission.SubmissionID)
            {
                return BadRequest();
            }

            _context.Entry(submission).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SubmissionExists(id))
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

        // DELETE: api/Submissions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubmission(int id)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound();
            }

            _context.Submissions.Remove(submission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Submissions/5/Files
        [HttpPost("{id}/Files")]
        public async Task<ActionResult<SubmissionFile>> AddSubmissionFile(int id, SubmissionFile file)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            file.SubmissionID = id;
            _context.SubmissionFiles.Add(file);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSubmissionFile", new { id = file.FileID }, file);
        }

        // GET: api/Submissions/5/Files
        [HttpGet("{id}/Files")]
        public async Task<ActionResult<IEnumerable<SubmissionFile>>> GetSubmissionFiles(int id)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            return await _context.SubmissionFiles
                .Where(f => f.SubmissionID == id)
                .ToListAsync();
        }

        // GET: api/Submissions/Files/5
        [HttpGet("Files/{id}")]
        public async Task<ActionResult<SubmissionFile>> GetSubmissionFile(int id)
        {
            var file = await _context.SubmissionFiles.FindAsync(id);
            if (file == null)
            {
                return NotFound();
            }

            return file;
        }

        // POST: api/Submissions/5/Comments
        [HttpPost("{id}/Comments")]
        public async Task<ActionResult<Comment>> AddSubmissionComment(int id, CommentRequest request)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            var user = await _context.Users.FindAsync(request.UserID);
            if (user == null)
            {
                return BadRequest("Invalid user ID");
            }

            var comment = new Comment
            {
                SubmissionID = id,
                UserID = request.UserID,
                Content = request.Content,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // If the comment is from a teacher, create a notification for the student
            if (user.UserType == "Teacher" && submission.StudentID != user.UserID)
            {
                var notification = new Notification
                {
                    UserID = submission.StudentID,
                    Title = "New Comment on Submission",
                    Message = $"Your submission has received a new comment from {user.FirstName} {user.LastName}",
                    NotificationType = "Comment",
                    ReferenceID = comment.CommentID,
                    CreatedAt = DateTime.Now
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction("GetComment", new { id = comment.CommentID }, comment);
        }

        // GET: api/Submissions/5/Comments
        [HttpGet("{id}/Comments")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetSubmissionComments(int id)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            return await _context.Comments
                .Where(c => c.SubmissionID == id)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Submissions/Comments/5
        [HttpGet("Comments/{id}")]
        public async Task<ActionResult<Comment>> GetComment(int id)
        {
            var comment = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.CommentID == id);

            if (comment == null)
            {
                return NotFound();
            }

            return comment;
        }

        private bool SubmissionExists(int id)
        {
            return _context.Submissions.Any(e => e.SubmissionID == id);
        }
    }

    // Using CommentRequest class from AssignmentsController
}
