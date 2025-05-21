import React, { useState } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import { getUser } from '../utils/auth';

const JoinCourse = () => {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getUser();

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    
    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Prepare enrollment data with current user information
      const enrollmentData = {
        userId: user?.id
      };
      
      // Call API to join course by code
      const response = await courseService.joinCourseByCode(classCode, enrollmentData);
      
      // Also update local storage for offline access
      try {
        const localCourses = JSON.parse(localStorage.getItem('userCourses') || '[]');
        if (response && response.data) {
          // Check if course already exists in local storage
          const exists = localCourses.some(course => course.id === response.data.id);
          if (!exists) {
            localCourses.push({
              ...response.data,
              role: 'student' // Set role as student since they're joining
            });
            localStorage.setItem('userCourses', JSON.stringify(localCourses));
          }
        }
      } catch (localErr) {
        console.warn('Error updating local storage:', localErr);
      }
      
      setSuccess('Successfully joined the course!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error joining course:', err);
      setError(err.response?.data?.message || 'Failed to join course. Please check your class code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Join a Class
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Ask your teacher for the class code, then enter it here
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          
          <form onSubmit={handleJoinCourse}>
            <TextField
              label="Class Code"
              variant="outlined"
              fullWidth
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Enter class code (e.g., abc123)"
              sx={{ mb: 3 }}
              disabled={loading}
              autoFocus
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading || !classCode.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Join'}
              </Button>
            </Box>
          </form>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Class code is 5-7 characters with letters and numbers, no spaces or symbols
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default JoinCourse;
