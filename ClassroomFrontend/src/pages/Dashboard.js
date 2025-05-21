import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { 
  Typography, 
  Grid, 
  Button, 
  Box,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Paper,
  Fab,
  IconButton,
  Breadcrumbs,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
  Slide
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService, courseService } from '../services/api';
import { getUser } from '../utils/auth';
import ClassCard from '../components/classroom/ClassCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const newCourseCreated = location.state?.newCourse;
  const [courses, setCourses] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [courseToArchive, setCourseToArchive] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const user = getUser();

  // Load current folder ID from localStorage on initial render
  useEffect(() => {
    const savedFolderId = localStorage.getItem('currentFolderId');
    if (savedFolderId) {
      setCurrentFolderId(savedFolderId);
    }
    
    // Show announcement after 10 seconds
    const timer = setTimeout(() => {
      setShowAnnouncement(true);
    }, 10000); // 10 seconds
    
    // If we just created a new course, show a success message
    if (newCourseCreated) {
      setStatusMessage({ 
        type: 'success', 
        message: 'Course created successfully! It should appear in your dashboard.' 
      });
      
      // Clear the navigation state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
    
    return () => clearTimeout(timer); // Clean up on unmount
  }, [newCourseCreated]);

  // Force a refresh when the component mounts or when returning from course creation
  useEffect(() => {
    // Force a refresh by setting loading to true
    setLoading(true);
  }, [newCourseCreated]);

  useEffect(() => {
    const fetchCoursesAndFolders = async () => {
      try {
        // First, check localStorage for any client-side courses/folders
        const localItems = JSON.parse(localStorage.getItem('userCourses') || '[]');
        
        let apiItems = [];
        let allItems = [];
        
        // Try to fetch from API
        try {
          // Since we've removed the strict teacher/student distinction,
          // try to fetch courses for both types
          try {
            const response = await userService.getTeacherCourses(user?.id);
            if (response && response.data) {
              apiItems = response.data || [];
            }
          } catch (teacherErr) {
            console.log('Not a teacher or no teacher courses');
            try {
              const response = await userService.getStudentCourses(user?.id);
              if (response && response.data) {
                apiItems = response.data || [];
              }
            } catch (studentErr) {
              console.log('Not a student or no student courses');
            }
          }
        } catch (apiErr) {
          console.warn('Failed to fetch courses from API, using local data only');
        }
        
        // Filter local items to only include those that belong to the current user
        const userLocalItems = localItems.filter(item => {
          // Include items if they are created by this user (teacher role)
          // or if the user has joined them (student role)
          return (
            (item.teacherId === user?.id) || 
            (item.createdBy === user?.id) ||
            (item.role === 'teacher') ||
            (item.role === 'student' && item.enrolledStudents?.includes(user?.id))
          );
        });
        
        // Combine all items - give preference to API items
        const apiItemIds = new Set(apiItems.map(item => item.id));
        const uniqueLocalItems = userLocalItems.filter(item => !apiItemIds.has(item.id));
        allItems = [...apiItems, ...uniqueLocalItems];
        
        // Separate courses and folders
        const coursesOnly = allItems.filter(item => !item.isFolder);
        const foldersOnly = allItems.filter(item => item.isFolder);
        
        // Filter courses by current folder
        const filteredCourses = coursesOnly.filter(course => 
          course.parentFolderId === currentFolderId
        );
        
        // Filter folders by current folder
        const filteredFolders = foldersOnly.filter(folder => 
          folder.parentFolderId === currentFolderId
        );
        
        setCourses(filteredCourses);
        setFolders(filteredFolders);
        
        // Update folder path if we're in a folder
        if (currentFolderId) {
          updateFolderPath(allItems, currentFolderId);
        } else {
          setFolderPath([]);
        }
      } catch (err) {
        console.error('Error fetching courses and folders:', err);
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to build folder path
    const updateFolderPath = (allItems, folderId) => {
      const path = [];
      
      // Build path from current folder back to root
      const buildPath = (id) => {
        const folder = allItems.find(item => item.id === id);
        if (folder) {
          path.unshift({ id: folder.id, name: folder.courseName });
          if (folder.parentFolderId) {
            buildPath(folder.parentFolderId);
          }
        }
      };
      
      buildPath(folderId);
      setFolderPath(path);
    };

    if (user) {
      fetchCoursesAndFolders();
    } else {
      setLoading(false);
      setCourses([]);
      setFolders([]);
    }
  }, [user, currentFolderId, newCourseCreated]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(item);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleEditCourse = (course) => {
    navigate(`/edit-course/${course.id}`, { state: { course } });
    handleMenuClose();
  };

  const handleArchiveConfirm = (course) => {
    setCourseToArchive(course);
    setArchiveConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveCourse = async () => {
    try {
      setLoading(true);
      
      // If we're using local storage for courses (no backend)
      const localItems = JSON.parse(localStorage.getItem('userCourses') || '[]');
      const updatedItems = localItems.filter(c => c.id !== courseToArchive.id);
      localStorage.setItem('userCourses', JSON.stringify(updatedItems));
      
      // Also try API call if available
      try {
        await courseService.archiveCourse(courseToArchive.id);
      } catch (apiErr) {
        console.log('Using local storage fallback for archiving');
      }
      
      // Update local state
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseToArchive.id));
      
      // Show success message
      setStatusMessage({ type: 'success', message: 'Course archived successfully' });
    } catch (err) {
      console.error('Error archiving course:', err);
      setStatusMessage({ type: 'error', message: 'Failed to archive course. Please try again.' });
    } finally {
      setArchiveConfirmOpen(false);
      setCourseToArchive(null);
      setLoading(false);
    }
  };
  
  const handleFolderClick = (folderId) => {
    setCurrentFolderId(folderId);
    // Save current folder ID to localStorage for persistence
    localStorage.setItem('currentFolderId', folderId);
  };
  
  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setFolderPath([]);
    // Clear current folder ID from localStorage
    localStorage.removeItem('currentFolderId');
  };
  
  const navigateToFolder = (folderId, index) => {
    setCurrentFolderId(folderId);
    // Truncate the path to this point
    setFolderPath(prev => prev.slice(0, index + 1));
    // Save current folder ID to localStorage for persistence
    localStorage.setItem('currentFolderId', folderId);
  };

  // Sample announcement data (would come from API in a real app)
  const announcement = {
    title: "Introducing Generative AI for Educators",
    description: "A two-hour, no-cost online course for K-12 educators. Save time and enhance lesson planning with generative AI.",
    actions: [
      { text: "Learn more", color: "primary", variant: "text" },
      { text: "Get started", color: "primary", variant: "text" }
    ]
  };
  
  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
  };
  
  return (
    <div>
      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {statusMessage.message && (
          <Alert severity={statusMessage.type} sx={{ mb: 3 }}>
            {statusMessage.message}
          </Alert>
        )}
        
        {/* Announcement Banner */}
        {announcement && (
          <Slide 
            direction="down" 
            in={showAnnouncement} 
            mountOnEnter 
            unmountOnExit
            timeout={800}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 4, 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: '#e8f0fe',
                borderRadius: 1,
                position: 'relative',
                transform: 'translateY(0)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                  <img 
                    src="/classroom-icon.svg" 
                    alt="Announcement" 
                    style={{ width: 60, height: 60 }} 
                  />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{announcement.title}</Typography>
                  <Typography variant="body2">{announcement.description}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {announcement.actions.map((action, index) => (
                    <Button 
                      key={index}
                      color={action.color} 
                      variant={action.variant}
                      size="small"
                    >
                      {action.text}
                    </Button>
                  ))}
                </Box>
                <IconButton 
                  size="small" 
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  aria-label="close"
                  onClick={handleCloseAnnouncement}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          </Slide>
        )}

        {/* Folder Navigation Breadcrumbs */}
        {folderPath.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="folder navigation"
            >
              <Link
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                color="inherit"
                onClick={navigateToRoot}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Home
              </Link>
              
              {folderPath.map((folder, index) => (
                <Link
                  key={folder.id}
                  underline="hover"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: index === folderPath.length - 1 ? 'bold' : 'normal'
                  }}
                  color="inherit"
                  onClick={() => navigateToFolder(folder.id, index)}
                >
                  {index < folderPath.length - 1 ? (
                    folder.name
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                      {folder.name}
                    </Box>
                  )}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>
        )}
        
        {/* No courses message */}
        {courses.length === 0 && folders.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8
          }}>
            <ClassIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No classes yet
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 500 }}>
              {currentFolderId 
                ? "This folder is empty. Add classes or create a new folder."
                : "Create or join classes to get started."}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/create-course')}
                startIcon={<AddIcon />}
              >
                Create class
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/join-course')}
              >
                Join class
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Grid of folders and courses */}
        {(courses.length > 0 || folders.length > 0) && (
          <Grid container spacing={3}>
            {/* Create New Course Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  overflow: 'hidden',
                  border: '2px dashed #ccc',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                    borderColor: 'primary.main'
                  }
                }}
                onClick={() => navigate('/create-course')}
                elevation={0}
              >
                <Box
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center'
                  }}
                >
                  <AddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" component="div" color="primary.main">
                    Create New Course
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Create a new course for your students
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Folder cards */}
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} key={folder.id} className="dashboard-item drop-animation">
                <Paper
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: '#f1f3f4',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                  onClick={() => handleFolderClick(folder.id)}
                  elevation={1}
                >
                  <Box
                    sx={{ 
                      bgcolor: '#FFA000', 
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FolderIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {folder.courseName}
                      </Typography>
                    </Box>
                    <IconButton 
                      aria-label="settings" 
                      sx={{ color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, folder);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ p: 2 }}>
                    {folder.description && (
                      <Typography variant="body2" color="text.secondary">
                        {folder.description}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
            
            {/* Course cards */}
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id} className="dashboard-item drop-animation">
                <ClassCard 
                  course={course} 
                  onMenuOpen={handleMenuOpen}
                  onFolderClick={handleFolderClick}
                />
              </Grid>
            ))}
            
            {/* Sample RISO card for demonstration */}
            <Grid item xs={12} sm={6} md={4} className="dashboard-item drop-animation">
              <ClassCard 
                course={{
                  id: 'sample-riso',
                  courseName: "RISO",
                  section: "Batch-2",
                  teacherName: "San Mie Htay",
                  subject: "Computer Science",
                  room: "A-101"
                }}
                onMenuOpen={(e) => {}}
              />
            </Grid>
          </Grid>
        )}
      </Container>
      
      {/* Floating action button for creating class */}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: 3
        }}
        onClick={() => navigate('/create-course')}
      >
        <AddIcon />
      </Fab>

      {/* Course menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedCourse && selectedCourse.isFolder ? (
          // Folder menu options
          <>
            <MenuItem onClick={() => {
              if (selectedCourse) {
                handleFolderClick(selectedCourse.id);
              }
              handleMenuClose();
            }}>Open Folder</MenuItem>
            <MenuItem onClick={handleMenuClose}>Rename</MenuItem>
            <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
          </>
        ) : (
          // Course menu options
          <>
            <MenuItem onClick={() => {
              if (selectedCourse) {
                navigate(`/class/${selectedCourse.id || 'preview'}`);
              }
              handleMenuClose();
            }}>View Details</MenuItem>
            <MenuItem onClick={() => selectedCourse && handleEditCourse(selectedCourse)}>Edit</MenuItem>
            <MenuItem onClick={() => selectedCourse && handleArchiveConfirm(selectedCourse)}>Archive</MenuItem>
          </>
        )}
      </Menu>

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        aria-labelledby="archive-dialog-title"
        aria-describedby="archive-dialog-description"
      >
        <DialogTitle id="archive-dialog-title">
          Archive Course
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="archive-dialog-description">
            Are you sure you want to archive "{courseToArchive?.courseName}"? 
            Archived courses will be moved to the archive section and will no longer appear on your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleArchiveCourse} color="error" variant="contained">
            Archive
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Announcement with drop animation */}
      {showAnnouncement && (
        <Paper 
          elevation={6} 
          className="announcement-slide drop-animation"
          sx={{ 
            p: 2, 
            backgroundColor: '#e8f5e9', 
            borderLeft: '4px solid #4caf50'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" color="primary">Announcement</Typography>
            <IconButton size="small" onClick={() => setShowAnnouncement(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body1" gutterBottom>
            Welcome to Google Classroom! Your courses are now ready for the new semester.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check out new features and updates for a better learning experience.
          </Typography>
        </Paper>
      )}
    </div>
  );
};

export default Dashboard;
