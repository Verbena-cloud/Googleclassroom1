-- Classroom Database Schema

-- Create database
CREATE DATABASE ClassroomDB;
GO

USE ClassroomDB;
GO

-- Users table (for both teachers and students)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL, -- Store hashed passwords in production
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    UserType NVARCHAR(20) NOT NULL CHECK (UserType IN ('Teacher', 'Student', 'Admin')),
    ProfilePicture NVARCHAR(255) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Courses table
CREATE TABLE Courses (
    CourseID INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(100) NOT NULL,
    CourseCode NVARCHAR(20) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    Section NVARCHAR(50) NULL,
    Subject NVARCHAR(50) NULL,
    Room NVARCHAR(50) NULL,
    TeacherID INT NOT NULL,
    IsArchived BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (TeacherID) REFERENCES Users(UserID)
);

-- Course Enrollment table (maps students to courses)
CREATE TABLE CourseEnrollments (
    EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    StudentID INT NOT NULL,
    EnrollmentDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Pending')),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    CONSTRAINT UQ_CourseEnrollment UNIQUE (CourseID, StudentID)
);

-- Announcements table
CREATE TABLE Announcements (
    AnnouncementID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    TeacherID INT NOT NULL,
    Title NVARCHAR(100) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (TeacherID) REFERENCES Users(UserID)
);

-- Assignments table
CREATE TABLE Assignments (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    Title NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    DueDate DATETIME NULL,
    PointsPossible INT NULL,
    AssignmentType NVARCHAR(50) DEFAULT 'Assignment' CHECK (AssignmentType IN ('Assignment', 'Quiz', 'Exam', 'Material')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Assignment Materials table (for files attached to assignments)
CREATE TABLE AssignmentMaterials (
    MaterialID INT IDENTITY(1,1) PRIMARY KEY,
    AssignmentID INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(50) NOT NULL,
    FileURL NVARCHAR(255) NOT NULL,
    UploadedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID)
);

-- Submissions table
CREATE TABLE Submissions (
    SubmissionID INT IDENTITY(1,1) PRIMARY KEY,
    AssignmentID INT NOT NULL,
    StudentID INT NOT NULL,
    SubmissionText NVARCHAR(MAX) NULL,
    Grade DECIMAL(5,2) NULL,
    Feedback NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) DEFAULT 'Submitted' CHECK (Status IN ('Draft', 'Submitted', 'Graded', 'Late')),
    SubmittedAt DATETIME DEFAULT GETDATE(),
    GradedAt DATETIME NULL,
    FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID),
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    CONSTRAINT UQ_StudentAssignment UNIQUE (AssignmentID, StudentID)
);

-- Submission Files table
CREATE TABLE SubmissionFiles (
    FileID INT IDENTITY(1,1) PRIMARY KEY,
    SubmissionID INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(50) NOT NULL,
    FileURL NVARCHAR(255) NOT NULL,
    UploadedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SubmissionID) REFERENCES Submissions(SubmissionID)
);

-- Comments table (for discussions on assignments)
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    AssignmentID INT NULL,
    SubmissionID INT NULL,
    UserID INT NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID),
    FOREIGN KEY (SubmissionID) REFERENCES Submissions(SubmissionID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CHECK (AssignmentID IS NOT NULL OR SubmissionID IS NOT NULL) -- Comment must be on either an assignment or submission
);

-- Notifications table
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Title NVARCHAR(100) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    IsRead BIT DEFAULT 0,
    NotificationType NVARCHAR(50) NOT NULL,
    ReferenceID INT NULL, -- Can reference various entities (assignment, announcement, etc.)
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

GO

-- Create stored procedures for common operations

-- Add a new user
CREATE PROCEDURE sp_AddUser
    @Email NVARCHAR(100),
    @Password NVARCHAR(255),
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @UserType NVARCHAR(20),
    @ProfilePicture NVARCHAR(255) = NULL
AS
BEGIN
    INSERT INTO Users (Email, Password, FirstName, LastName, UserType, ProfilePicture)
    VALUES (@Email, @Password, @FirstName, @LastName, @UserType, @ProfilePicture);
    
    SELECT SCOPE_IDENTITY() AS UserID;
END
GO

-- Create a new course
CREATE PROCEDURE sp_CreateCourse
    @CourseName NVARCHAR(100),
    @CourseCode NVARCHAR(20),
    @Description NVARCHAR(MAX) = NULL,
    @Section NVARCHAR(50) = NULL,
    @Subject NVARCHAR(50) = NULL,
    @Room NVARCHAR(50) = NULL,
    @TeacherID INT
AS
BEGIN
    INSERT INTO Courses (CourseName, CourseCode, Description, Section, Subject, Room, TeacherID)
    VALUES (@CourseName, @CourseCode, @Description, @Section, @Subject, @Room, @TeacherID);
    
    SELECT SCOPE_IDENTITY() AS CourseID;
END
GO

-- Enroll a student in a course
CREATE PROCEDURE sp_EnrollStudent
    @CourseID INT,
    @StudentID INT,
    @Status NVARCHAR(20) = 'Active'
AS
BEGIN
    -- Check if the enrollment already exists
    IF NOT EXISTS (SELECT 1 FROM CourseEnrollments WHERE CourseID = @CourseID AND StudentID = @StudentID)
    BEGIN
        INSERT INTO CourseEnrollments (CourseID, StudentID, Status)
        VALUES (@CourseID, @StudentID, @Status);
        
        SELECT SCOPE_IDENTITY() AS EnrollmentID;
    END
    ELSE
    BEGIN
        -- Update the status if enrollment exists
        UPDATE CourseEnrollments
        SET Status = @Status
        WHERE CourseID = @CourseID AND StudentID = @StudentID;
        
        SELECT EnrollmentID FROM CourseEnrollments WHERE CourseID = @CourseID AND StudentID = @StudentID;
    END
END
GO

-- Create a new assignment
CREATE PROCEDURE sp_CreateAssignment
    @CourseID INT,
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX) = NULL,
    @DueDate DATETIME = NULL,
    @PointsPossible INT = NULL,
    @AssignmentType NVARCHAR(50) = 'Assignment'
AS
BEGIN
    INSERT INTO Assignments (CourseID, Title, Description, DueDate, PointsPossible, AssignmentType)
    VALUES (@CourseID, @Title, @Description, @DueDate, @PointsPossible, @AssignmentType);
    
    SELECT SCOPE_IDENTITY() AS AssignmentID;
END
GO

-- Submit an assignment
CREATE PROCEDURE sp_SubmitAssignment
    @AssignmentID INT,
    @StudentID INT,
    @SubmissionText NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(20) = 'Submitted'
AS
BEGIN
    -- Check if a submission already exists
    IF NOT EXISTS (SELECT 1 FROM Submissions WHERE AssignmentID = @AssignmentID AND StudentID = @StudentID)
    BEGIN
        INSERT INTO Submissions (AssignmentID, StudentID, SubmissionText, Status)
        VALUES (@AssignmentID, @StudentID, @SubmissionText, @Status);
        
        SELECT SCOPE_IDENTITY() AS SubmissionID;
    END
    ELSE
    BEGIN
        -- Update the existing submission
        UPDATE Submissions
        SET SubmissionText = @SubmissionText,
            Status = @Status,
            SubmittedAt = GETDATE()
        WHERE AssignmentID = @AssignmentID AND StudentID = @StudentID;
        
        SELECT SubmissionID FROM Submissions WHERE AssignmentID = @AssignmentID AND StudentID = @StudentID;
    END
END
GO

-- Grade a submission
CREATE PROCEDURE sp_GradeSubmission
    @SubmissionID INT,
    @Grade DECIMAL(5,2),
    @Feedback NVARCHAR(MAX) = NULL
AS
BEGIN
    UPDATE Submissions
    SET Grade = @Grade,
        Feedback = @Feedback,
        Status = 'Graded',
        GradedAt = GETDATE()
    WHERE SubmissionID = @SubmissionID;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Get courses for a teacher
CREATE PROCEDURE sp_GetTeacherCourses
    @TeacherID INT
AS
BEGIN
    SELECT 
        c.CourseID,
        c.CourseName,
        c.CourseCode,
        c.Description,
        c.Section,
        c.Subject,
        c.Room,
        c.IsArchived,
        c.CreatedAt,
        (SELECT COUNT(*) FROM CourseEnrollments ce WHERE ce.CourseID = c.CourseID) AS EnrolledStudents
    FROM Courses c
    WHERE c.TeacherID = @TeacherID
    ORDER BY c.IsArchived, c.CreatedAt DESC;
END
GO

-- Get courses for a student
CREATE PROCEDURE sp_GetStudentCourses
    @StudentID INT
AS
BEGIN
    SELECT 
        c.CourseID,
        c.CourseName,
        c.CourseCode,
        c.Description,
        c.Section,
        c.Subject,
        c.Room,
        c.IsArchived,
        u.FirstName + ' ' + u.LastName AS TeacherName,
        ce.Status AS EnrollmentStatus,
        ce.EnrollmentDate
    FROM CourseEnrollments ce
    JOIN Courses c ON ce.CourseID = c.CourseID
    JOIN Users u ON c.TeacherID = u.UserID
    WHERE ce.StudentID = @StudentID
    ORDER BY c.IsArchived, c.CreatedAt DESC;
END
GO

-- Get assignments for a course
CREATE PROCEDURE sp_GetCourseAssignments
    @CourseID INT
AS
BEGIN
    SELECT 
        a.AssignmentID,
        a.Title,
        a.Description,
        a.DueDate,
        a.PointsPossible,
        a.AssignmentType,
        a.CreatedAt,
        (SELECT COUNT(*) FROM Submissions s WHERE s.AssignmentID = a.AssignmentID) AS SubmissionsCount
    FROM Assignments a
    WHERE a.CourseID = @CourseID
    ORDER BY a.DueDate DESC;
END
GO

-- Get student submissions for an assignment
CREATE PROCEDURE sp_GetAssignmentSubmissions
    @AssignmentID INT
AS
BEGIN
    SELECT 
        s.SubmissionID,
        s.AssignmentID,
        s.StudentID,
        u.FirstName + ' ' + u.LastName AS StudentName,
        s.SubmissionText,
        s.Grade,
        s.Feedback,
        s.Status,
        s.SubmittedAt,
        s.GradedAt
    FROM Submissions s
    JOIN Users u ON s.StudentID = u.UserID
    WHERE s.AssignmentID = @AssignmentID
    ORDER BY s.Status, s.SubmittedAt;
END
GO

-- Get a student's submission for an assignment
CREATE PROCEDURE sp_GetStudentSubmission
    @AssignmentID INT,
    @StudentID INT
AS
BEGIN
    SELECT 
        s.SubmissionID,
        s.SubmissionText,
        s.Grade,
        s.Feedback,
        s.Status,
        s.SubmittedAt,
        s.GradedAt,
        a.Title AS AssignmentTitle,
        a.Description AS AssignmentDescription,
        a.DueDate,
        a.PointsPossible
    FROM Submissions s
    JOIN Assignments a ON s.AssignmentID = a.AssignmentID
    WHERE s.AssignmentID = @AssignmentID AND s.StudentID = @StudentID;
END
GO

-- Create an announcement
CREATE PROCEDURE sp_CreateAnnouncement
    @CourseID INT,
    @TeacherID INT,
    @Title NVARCHAR(100),
    @Content NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Announcements (CourseID, TeacherID, Title, Content)
    VALUES (@CourseID, @TeacherID, @Title, @Content);
    
    SELECT SCOPE_IDENTITY() AS AnnouncementID;
END
GO

-- Get announcements for a course
CREATE PROCEDURE sp_GetCourseAnnouncements
    @CourseID INT
AS
BEGIN
    SELECT 
        a.AnnouncementID,
        a.Title,
        a.Content,
        a.CreatedAt,
        u.FirstName + ' ' + u.LastName AS TeacherName
    FROM Announcements a
    JOIN Users u ON a.TeacherID = u.UserID
    WHERE a.CourseID = @CourseID
    ORDER BY a.CreatedAt DESC;
END
GO

-- Add a comment to an assignment or submission
CREATE PROCEDURE sp_AddComment
    @AssignmentID INT = NULL,
    @SubmissionID INT = NULL,
    @UserID INT,
    @Content NVARCHAR(MAX)
AS
BEGIN
    IF (@AssignmentID IS NULL AND @SubmissionID IS NULL)
        RAISERROR('Either AssignmentID or SubmissionID must be provided', 16, 1);
    ELSE
    BEGIN
        INSERT INTO Comments (AssignmentID, SubmissionID, UserID, Content)
        VALUES (@AssignmentID, @SubmissionID, @UserID, @Content);
        
        SELECT SCOPE_IDENTITY() AS CommentID;
    END
END
GO

-- Get comments for an assignment
CREATE PROCEDURE sp_GetAssignmentComments
    @AssignmentID INT
AS
BEGIN
    SELECT 
        c.CommentID,
        c.Content,
        c.CreatedAt,
        u.UserID,
        u.FirstName + ' ' + u.LastName AS UserName,
        u.UserType
    FROM Comments c
    JOIN Users u ON c.UserID = u.UserID
    WHERE c.AssignmentID = @AssignmentID
    ORDER BY c.CreatedAt;
END
GO

-- Get comments for a submission
CREATE PROCEDURE sp_GetSubmissionComments
    @SubmissionID INT
AS
BEGIN
    SELECT 
        c.CommentID,
        c.Content,
        c.CreatedAt,
        u.UserID,
        u.FirstName + ' ' + u.LastName AS UserName,
        u.UserType
    FROM Comments c
    JOIN Users u ON c.UserID = u.UserID
    WHERE c.SubmissionID = @SubmissionID
    ORDER BY c.CreatedAt;
END
GO

-- Create a notification
CREATE PROCEDURE sp_CreateNotification
    @UserID INT,
    @Title NVARCHAR(100),
    @Message NVARCHAR(MAX),
    @NotificationType NVARCHAR(50),
    @ReferenceID INT = NULL
AS
BEGIN
    INSERT INTO Notifications (UserID, Title, Message, NotificationType, ReferenceID)
    VALUES (@UserID, @Title, @Message, @NotificationType, @ReferenceID);
    
    SELECT SCOPE_IDENTITY() AS NotificationID;
END
GO

-- Get notifications for a user
CREATE PROCEDURE sp_GetUserNotifications
    @UserID INT
AS
BEGIN
    SELECT 
        NotificationID,
        Title,
        Message,
        IsRead,
        NotificationType,
        ReferenceID,
        CreatedAt
    FROM Notifications
    WHERE UserID = @UserID
    ORDER BY IsRead, CreatedAt DESC;
END
GO

-- Mark notification as read
CREATE PROCEDURE sp_MarkNotificationAsRead
    @NotificationID INT
AS
BEGIN
    UPDATE Notifications
    SET IsRead = 1
    WHERE NotificationID = @NotificationID;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
