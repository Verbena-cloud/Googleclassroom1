import React, { useState } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Alert,
  Stack,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
// In a real app, we would use the API service
// import { courseService } from '../services/api';
import { getUser } from '../utils/auth';
import { getClassColor, getClassInitials } from '../utils/classUtils';

const JoinClass = () => {
  const navigate = useNavigate();
  // We'll use the user in a real app when connecting to the API
  // const user = getUser();
  getUser(); // Just to ensure the user is authenticated
  
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [foundClass, setFoundClass] = useState(null);
  
  // Sample class data (in a real app, this would come from an API)
  const availableClasses = [
    {
      id: 'abc123',
      code: 'abc123',
      courseName: 'Introduction to Programming',
      section: 'Section A',
      teacherName: 'John Doe',
      subject: 'Computer Science',
      room: 'Room 101'
    },
    {
      id: 'def456',
      code: 'def456',
      courseName: 'Advanced Mathematics',
      section: 'Calculus II',
      teacherName: 'Jane Smith',
      subject: 'Mathematics',
      room: 'Room 202'
    },
    {
      id: 'ghi789',
      code: 'ghi789',
      courseName: 'World History',
      section: 'Modern Era',
      teacherName: 'Robert Johnson',
      subject: 'History',
      room: 'Room 303'
    }
  ];
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleChange = (e) => {
    setClassCode(e.target.value);
    setFoundClass(null); // Reset found class when code changes
    setError('');
  };
  
  // Search for class by code
  const searchClass = async () => {
    if (!classCode.trim()) {
      setError('Class code is required');
      return;
    }
    
    try {
      setSearching(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find class by code
      const found = availableClasses.find(c => c.code === classCode.trim());
      
      if (found) {
        setFoundClass(found);
      } else {
        setError('Class not found. Please check the class code and try again.');
      }
    } catch (err) {
      console.error('Error searching for class:', err);
      setError('Failed to search for class. Please try again.');
    } finally {
      setSearching(false);
    }
  };
  
  // Handle Enter key press in the text field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchClass();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!foundClass) {
      // If no class is found yet, search for it
      searchClass();
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Joined class:', foundClass);
      
      // Show success and redirect
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error joining class:', err);
      setError('Failed to join class. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} justifyContent="center">
        {/* Join Class Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Join class
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Successfully joined the class! Redirecting to dashboard...
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Typography variant="body2" color="textSecondary">
                  Ask your teacher for the class code, then enter it here.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Class code"
                    value={classCode}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    required
                    variant="outlined"
                    placeholder="e.g., abc123"
                    disabled={searching || loading || success}
                    sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
                  />
                  
                  {!foundClass && (
                    <Button 
                      variant="contained" 
                      onClick={searchClass}
                      disabled={searching || !classCode.trim() || loading || success}
                      sx={{ minWidth: '100px' }}
                    >
                      {searching ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                  )}
                </Box>
                
                {/* Class Preview */}
                {foundClass && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Class Found
                      </Typography>
                    </Divider>
                    
                    <Card sx={{ mb: 2, position: 'relative' }}>
                      <Box 
                        sx={{ 
                          bgcolor: getClassColor(foundClass.courseName),
                          color: 'white',
                          p: 2,
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4
                        }}
                      >
                        <Typography variant="h6">{foundClass.courseName}</Typography>
                        <Typography variant="body2">{foundClass.section}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{foundClass.teacherName}</Typography>
                        
                        <Avatar
                          sx={{
                            bgcolor: '#ffffff',
                            color: getClassColor(foundClass.courseName),
                            width: 50,
                            height: 50,
                            position: 'absolute',
                            top: 70,
                            right: 16,
                            border: '2px solid white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {getClassInitials(foundClass.courseName)}
                        </Avatar>
                      </Box>
                      
                      <CardContent sx={{ pt: 4 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Subject:</strong> {foundClass.subject}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Room:</strong> {foundClass.room}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    disabled={loading || success || (!foundClass && !classCode.trim())}
                  >
                    {foundClass ? (loading ? <CircularProgress size={24} /> : 'Join') : 'Search'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Grid>
        
        {/* Instructions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              How to join a class
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  1. Get the class code
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Your teacher will give you a class code. Make sure you use the correct code.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  2. Enter the code
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Enter the class code in the field and click "Search" to find the class.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  3. Verify and join
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Verify that you're joining the correct class, then click "Join".
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                You can use these sample codes to test: <strong>abc123</strong>, <strong>def456</strong>, or <strong>ghi789</strong>
              </Alert>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JoinClass;
