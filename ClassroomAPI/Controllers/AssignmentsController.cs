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
    public class AssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AssignmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Assignments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Assignment>>> GetAssignments()
        {
            return await _context.Assignments
                .Include(a => a.Course)
                .ToListAsync();
        }

        // GET: api/Assignments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Assignment>> GetAssignment(int id)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.AssignmentID == id);

            if (assignment == null)
            {
                return NotFound();
            }

            return assignment;
        }

        // POST: api/Assignments
        [HttpPost]
        public async Task<ActionResult<Assignment>> CreateAssignment(Assignment assignment)
        {
            // Verify course exists
            var course = await _context.Courses.FindAsync(assignment.CourseID);
            if (course == null)
            {
                return BadRequest("Invalid course ID");
            }

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAssignment), new { id = assignment.AssignmentID }, assignment);
        }

        // PUT: api/Assignments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAssignment(int id, Assignment assignment)
        {
            if (id != assignment.AssignmentID)
            {
                return BadRequest();
            }

            _context.Entry(assignment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AssignmentExists(id))
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

        // DELETE: api/Assignments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound();
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Assignments/5/Materials
        [HttpPost("{id}/Materials")]
        public async Task<ActionResult<AssignmentMaterial>> AddAssignmentMaterial(int id, AssignmentMaterial material)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            material.AssignmentID = id;
            _context.AssignmentMaterials.Add(material);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAssignmentMaterial", new { id = material.MaterialID }, material);
        }

        // GET: api/Assignments/5/Materials
        [HttpGet("{id}/Materials")]
        public async Task<ActionResult<IEnumerable<AssignmentMaterial>>> GetAssignmentMaterials(int id)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            return await _context.AssignmentMaterials
                .Where(m => m.AssignmentID == id)
                .ToListAsync();
        }

        // GET: api/Assignments/Materials/5
        [HttpGet("Materials/{id}")]
        public async Task<ActionResult<AssignmentMaterial>> GetAssignmentMaterial(int id)
        {
            var material = await _context.AssignmentMaterials.FindAsync(id);
            if (material == null)
            {
                return NotFound();
            }

            return material;
        }

        // GET: api/Assignments/5/Submissions
        [HttpGet("{id}/Submissions")]
        public async Task<ActionResult<IEnumerable<Submission>>> GetAssignmentSubmissions(int id)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            return await _context.Submissions
                .Where(s => s.AssignmentID == id)
                .Include(s => s.Student)
                .ToListAsync();
        }

        // GET: api/Assignments/5/Student/6/Submission
        [HttpGet("{assignmentId}/Student/{studentId}/Submission")]
        public async Task<ActionResult<Submission>> GetStudentSubmission(int assignmentId, int studentId)
        {
            var submission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentID == assignmentId && s.StudentID == studentId);

            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            return submission;
        }

        // POST: api/Assignments/5/Student/6/Submit
        [HttpPost("{assignmentId}/Student/{studentId}/Submit")]
        public async Task<ActionResult<Submission>> SubmitAssignment(int assignmentId, int studentId, SubmissionRequest request)
        {
            var assignment = await _context.Assignments.FindAsync(assignmentId);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            var student = await _context.Users.FindAsync(studentId);
            if (student == null || student.UserType != "Student")
            {
                return BadRequest("Invalid student ID");
            }

            // Check if submission already exists
            var existingSubmission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentID == assignmentId && s.StudentID == studentId);

            if (existingSubmission != null)
            {
                // Update existing submission
                existingSubmission.SubmissionText = request.SubmissionText;
                existingSubmission.Status = request.Status ?? "Submitted";
                existingSubmission.SubmittedAt = DateTime.Now;
                _context.Entry(existingSubmission).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return existingSubmission;
            }
            else
            {
                // Create new submission
                var submission = new Submission
                {
                    AssignmentID = assignmentId,
                    StudentID = studentId,
                    SubmissionText = request.SubmissionText,
                    Status = request.Status ?? "Submitted",
                    SubmittedAt = DateTime.Now
                };

                _context.Submissions.Add(submission);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    "GetStudentSubmission", 
                    new { assignmentId = assignmentId, studentId = studentId }, 
                    submission);
            }
        }

        // POST: api/Assignments/Submissions/5/Grade
        [HttpPost("Submissions/{id}/Grade")]
        public async Task<IActionResult> GradeSubmission(int id, GradeRequest request)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            submission.Grade = request.Grade;
            submission.Feedback = request.Feedback;
            submission.Status = "Graded";
            submission.GradedAt = DateTime.Now;

            _context.Entry(submission).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok("Submission graded successfully");
        }

        // POST: api/Assignments/5/Comments
        [HttpPost("{id}/Comments")]
        public async Task<ActionResult<Comment>> AddAssignmentComment(int id, CommentRequest request)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            var user = await _context.Users.FindAsync(request.UserID);
            if (user == null)
            {
                return BadRequest("Invalid user ID");
            }

            var comment = new Comment
            {
                AssignmentID = id,
                UserID = request.UserID,
                Content = request.Content,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetComment", new { id = comment.CommentID }, comment);
        }

        // GET: api/Assignments/5/Comments
        [HttpGet("{id}/Comments")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetAssignmentComments(int id)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            return await _context.Comments
                .Where(c => c.AssignmentID == id)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Assignments/Comments/5
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

        private bool AssignmentExists(int id)
        {
            return _context.Assignments.Any(e => e.AssignmentID == id);
        }
    }

    public class SubmissionRequest
    {
        public string SubmissionText { get; set; }
        public string Status { get; set; }
    }

    public class GradeRequest
    {
        public decimal Grade { get; set; }
        public string Feedback { get; set; }
    }

    public class CommentRequest
    {
        public int UserID { get; set; }
        public string Content { get; set; }
    }
}
