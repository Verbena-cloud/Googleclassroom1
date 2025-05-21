import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid,
  Avatar,
  Divider,
  Button,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnnouncementIcon from '@mui/icons-material/Announcement';
// We'll use these in the future when connecting to the real API
// import { courseService } from '../services/api';
// import { getUser } from '../utils/auth';
import ClassFolder from '../components/classroom/ClassFolder';
import { getClassColor, getClassInitials } from '../utils/classUtils';

const ClassView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  // We'll use this in the future when connecting to the real API
  // const user = getUser();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch the course details from the API
        // For now, we'll use mock data
        let mockCourse;
        
        if (courseId === 'preview') {
          // For preview, use the sample RISO course
          mockCourse = {
            id: 'preview',
            courseName: "RISO",
            section: "Batch-2",
            teacherName: "San Mie Htay",
            subject: "Computer Science",
            room: "A-101"
          };
        } else if (courseId === 'sample-riso') {
          // For the sample card from dashboard
          mockCourse = {
            id: 'sample-riso',
            courseName: "RISO",
            section: "Batch-2",
            teacherName: "San Mie Htay",
            subject: "Computer Science",
            room: "A-101"
          };
        } else {
          // For any other ID, we'd normally fetch from API
          // For now, create a generic course
          mockCourse = {
            id: courseId,
            courseName: "Class " + courseId,
            section: "Section 1",
            teacherName: "Teacher",
            subject: "Subject",
            room: "Room"
          };
        }
        
        setCourse(mockCourse);
      } catch (err) {
        console.error('Error fetching course details:', err);
        // Convert error object to string to avoid rendering issues
        const errorMessage = typeof err === 'object' ? 
          (err.message || 'Failed to load course details. Please try again later.') : 
          String(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourseDetails();
    } else {
      setError('No course ID provided');
      setLoading(false);
    }
  }, [courseId]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }
  
  if (!course) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Course not found</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }
  
  // Get class color and initials with fallbacks
  const classColor = course?.courseName ? getClassColor(course.courseName) : '#4285F4';
  const classInitials = course?.courseName ? getClassInitials(course.courseName) : '?';
  
  return (
    <Box sx={{ pb: 4 }}>
      {/* Class Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: classColor, 
          color: 'white', 
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ pt: 6, pb: 8, position: 'relative' }}>
            <IconButton 
              sx={{ color: 'white', position: 'absolute', top: 16, left: 0 }}
              onClick={() => navigate('/dashboard')}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 5 }}>
              <Avatar
                sx={{
                  bgcolor: 'white',
                  color: classColor,
                  width: 60,
                  height: 60,
                  mr: 2,
                  fontSize: '1.8rem',
                  fontWeight: 'bold'
                }}
              >
                {classInitials}
              </Avatar>
              
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  {course.courseName}
                </Typography>
                <Typography variant="subtitle1">
                  {course.section} • {course.subject}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
        
        {/* Tabs */}
        <Paper 
          elevation={1} 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="lg">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ bgcolor: 'white' }}
            >
              <Tab icon={<AnnouncementIcon />} label="Stream" />
              <Tab icon={<AssignmentIcon />} label="Classwork" />
              <Tab icon={<PeopleIcon />} label="People" />
            </Tabs>
          </Container>
        </Paper>
      </Paper>
      
      <Container maxWidth="lg">
        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Stream
            </Typography>
            <Typography variant="body1" color="textSecondary">
              This is where you'll see announcements and updates from your teacher.
            </Typography>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Classwork
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                This is where you'll find assignments and class materials.
              </Typography>
              
              {/* Class Folder Component */}
              <ClassFolder course={course} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Class Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Teacher
                  </Typography>
                  <Typography variant="body1">
                    {course.teacherName}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Subject
                  </Typography>
                  <Typography variant="body1">
                    {course.subject}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Room
                  </Typography>
                  <Typography variant="body1">
                    {course.room}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              People
            </Typography>
            <Typography variant="body1" color="textSecondary">
              This is where you'll see the list of teachers and students in this class.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ClassView;
