import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Button, 
  Box,
  CircularProgress,
  Alert,
  Fab,
  Container,
  Card,
  CardMedia,
  IconButton,
  Divider,
  Avatar,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';
import { getClassInitials, getClassBackground } from '../utils/classUtils';
import classroomLogo from '../assets/images/classroom_logo.svg';
import QuickCreateCourse from '../components/classroom/QuickCreateCourse';

const GoogleClassroomDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false);
  
  // Get current user for filtering courses
  const currentUser = getUser();
  
  // Use currentUser in the useEffect to filter courses if needed
  useEffect(() => {
    if (currentUser) {
      console.log('Current user:', currentUser.id);
    }
  }, [currentUser]);
  
  // Show announcement after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnnouncement(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load courses on component mount
  useEffect(() => {
    const loadCourses = () => {
      try {
        setLoading(true);
        
        // Get courses from localStorage
        const localCourses = JSON.parse(localStorage.getItem('userCourses') || '[]');
        
        // Remove any date fields from display
        const processedCourses = localCourses.map(course => {
          const { createdAt, updatedAt, ...courseWithoutDates } = course;
          return courseWithoutDates;
        });
        
        console.log('Courses from localStorage:', processedCourses);
        
        // Set courses state with processed courses (no dates)
        setCourses(processedCourses);
        
        // Show success message if redirected from course creation
        const params = new URLSearchParams(window.location.search);
        if (params.get('newCourse') === 'true') {
          setStatusMessage({ 
            type: 'success', 
            message: 'Course created successfully! It should appear in your dashboard.' 
          });
          
          // Clear the URL parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);

  const handleCreateClass = () => {
    // Open the quick create course dialog instead of navigating
    setShowCreateCourseDialog(true);
  };
  
  const handleCreateCourseSuccess = (newCourse) => {
    // Add the new course to the courses state
    setCourses(prevCourses => [newCourse, ...prevCourses]);
    
    // Show success message
    setStatusMessage({
      type: 'success',
      message: 'Course created successfully!'
    });
  };
  
  const handleJoinClass = () => {
    navigate('/join-course');
  };
  
  const handleCourseClick = (courseId) => {
    navigate(`/class/${courseId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {statusMessage.message && (
        <Alert severity={statusMessage.type} sx={{ mb: 3 }}>
          {statusMessage.message}
        </Alert>
      )}
      
      {/* Announcement banner */}
      {showAnnouncement && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: '8px',
            bgcolor: '#e8f0fe',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box 
              component="img" 
              src={classroomLogo} 
              alt="Google Classroom logo"
              sx={{ 
                width: 80, 
                height: 80, 
                mr: 2
              }}
            />
            <Box>
              <Typography variant="h6" gutterBottom>
                Introducing Generative AI for Educators
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A two-hour, no-cost online course for K-12 educators. Save time and enhance lesson planning with generative AI.
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button 
                  variant="text" 
                  sx={{ mr: 1, bgcolor: '#e8f0fe', '&:hover': { bgcolor: '#d0e0fc' } }}
                  onClick={() => console.log('Learn more clicked')}
                >
                  Learn more
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}
                  onClick={() => console.log('Get started clicked')}
                >
                  Get started
                </Button>
              </Box>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setShowAnnouncement(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}
      
      {/* Courses section */}
      {courses.length > 0 ? (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
            Classes
          </Typography>
          
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CardMedia
                    sx={{ 
                      height: 98, 
                      background: course.bannerImage ? 
                        `url(${course.bannerImage})` : 
                        (course.themeBackground || getClassBackground(course.courseName || '')),
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 500, fontSize: '1.25rem' }}>
                            {course.courseName}
                          </Typography>
                          {course.section && (
                            <Typography variant="body2" sx={{ color: 'white', mt: 0.5 }}>
                              {course.section}
                            </Typography>
                          )}
                        </Box>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', p: 0.5, mt: -0.5, mr: -0.5 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle menu open
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      {course.teacherName && (
                        <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mt: 1 }}>
                          {course.teacherName}
                        </Typography>
                      )}
                    </Box>
                  </CardMedia>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    p: 1.5, 
                    position: 'relative',
                    minHeight: '80px'
                  }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: course.themeBackground || getClassBackground(course.courseName || ''),
                        position: 'absolute',
                        right: 16,
                        top: -30,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        border: '2px solid white'
                      }}
                    >
                      {getClassInitials(course.courseName || '')}
                    </Avatar>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ 
                    p: 1.5, 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    bgcolor: '#f8f8f8',
                    gap: 1
                  }}>
                    <IconButton size="small" sx={{ color: 'text.secondary', p: 0.5 }}>
                      <FolderOpenIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'text.secondary', p: 0.5 }}>
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 8
        }}>
          <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No classes yet
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 500 }}>
            Create or join classes to get started.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCreateClass}
              startIcon={<AddIcon />}
            >
              Create class
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleJoinClass}
            >
              Join class
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Floating action button for creating class */}
      {courses.length > 0 && (
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            boxShadow: 3
          }}
          onClick={handleCreateClass}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Quick Create Course Dialog */}
      <QuickCreateCourse 
        open={showCreateCourseDialog}
        onClose={() => setShowCreateCourseDialog(false)}
        onSuccess={handleCreateCourseSuccess}
      />
    </Container>
  );
};

export default GoogleClassroomDashboard;
