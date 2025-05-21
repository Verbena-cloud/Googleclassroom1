using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace ClassroomAPI.Services
{
    public interface IFileService
    {
        Task<string> CreateCourseFolderAsync(int courseId, string courseName);
        Task<string> GetCourseFolderPathAsync(int courseId);
        Task<bool> FolderExistsAsync(string path);
    }

    public class FileService : IFileService
    {
        private readonly ILogger<FileService> _logger;
        private readonly string _baseFolderPath;

        public FileService(ILogger<FileService> logger)
        {
            _logger = logger;
            
            // Base folder where all course folders will be created
            _baseFolderPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                "ClassroomApp", "Courses");
                
            // Ensure the base directory exists
            if (!Directory.Exists(_baseFolderPath))
            {
                Directory.CreateDirectory(_baseFolderPath);
            }
        }

        public async Task<string> CreateCourseFolderAsync(int courseId, string courseName)
        {
            try
            {
                // Create a folder name using courseId and courseName
                // Remove invalid characters from the courseName
                string sanitizedCourseName = string.Join("_", courseName.Split(Path.GetInvalidFileNameChars()));
                
                // Create folder name format: CourseID_CourseName
                string folderName = $"{courseId}_{sanitizedCourseName}";
                string courseFolderPath = Path.Combine(_baseFolderPath, folderName);
                
                // Create the course folder if it doesn't exist
                if (!Directory.Exists(courseFolderPath))
                {
                    Directory.CreateDirectory(courseFolderPath);
                    _logger.LogInformation($"Created course folder: {courseFolderPath}");
                    
                    // Create subfolders for different types of content
                    Directory.CreateDirectory(Path.Combine(courseFolderPath, "Assignments"));
                    Directory.CreateDirectory(Path.Combine(courseFolderPath, "Materials"));
                    Directory.CreateDirectory(Path.Combine(courseFolderPath, "Submissions"));
                }
                
                return await Task.FromResult(courseFolderPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating course folder for course {courseId}");
                throw;
            }
        }

        public async Task<string> GetCourseFolderPathAsync(int courseId)
        {
            try
            {
                // Find the folder that starts with the courseId
                string[] directories = Directory.GetDirectories(_baseFolderPath, $"{courseId}_*");
                
                if (directories.Length > 0)
                {
                    return await Task.FromResult(directories[0]);
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting course folder path for course {courseId}");
                throw;
            }
        }

        public async Task<bool> FolderExistsAsync(string path)
        {
            return await Task.FromResult(Directory.Exists(path));
        }
    }
}
