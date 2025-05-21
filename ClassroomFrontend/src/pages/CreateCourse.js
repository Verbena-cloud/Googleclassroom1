import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Grid, TextField, Typography,
  Alert, Stack, Container, Card, CardContent, CardMedia, IconButton,
  AppBar, Toolbar, Menu,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import PaletteIcon from '@mui/icons-material/Palette';
import { getUser } from '../utils/auth';
import { getClassColor, getClassInitials, getClassBackground } from '../utils/classUtils';
import { courseService } from '../services/api';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  
  // Ensure we have a user for the course creation
  useEffect(() => {
    // If no user is found, create a mock user for local development
    if (!user) {
      const mockUser = {
        id: 'local-user-' + Date.now(),
        name: 'Local User',
        email: 'localuser@example.com'
      };
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  }, [user]);
  
  const [formData, setFormData] = useState({
    courseName: '',
    section: '',
    subject: '',
    room: '',
    classCode: '',
    description: ''
  });
  
  // Preview state for the class card
  const [previewBackground, setPreviewBackground] = useState('linear-gradient(135deg, #4285F4 0%, #5B8DEF 50%, #7DA9F9 100%)'); // Default Google blue gradient
  const [previewInitials, setPreviewInitials] = useState('');
  
  // Theme options for class header - using gradients
  const themeGradients = [
    'linear-gradient(135deg, #4285F4 0%, #5B8DEF 50%, #7DA9F9 100%)', // Blue
    'linear-gradient(135deg, #0F9D58 0%, #57BB8A 80%, #B7E1CD 100%)', // Green
    'linear-gradient(135deg, #DB4437 0%, #E67C73 80%, #FADAD9 100%)', // Red
    'linear-gradient(135deg, #F4B400 0%, #FDD663 80%, #FEE8A2 100%)', // Yellow
    'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 80%, #D1C4E9 100%)', // Purple
    'linear-gradient(135deg, #3949AB 0%, #5C6BC0 80%, #9FA8DA 100%)', // Indigo
    'linear-gradient(135deg, #00796B 0%, #26A69A 80%, #B2DFDB 100%)', // Teal
    'linear-gradient(135deg, #5D4037 0%, #8D6E63 80%, #D7CCC8 100%)', // Brown
    'linear-gradient(135deg, #455A64 0%, #78909C 80%, #CFD8DC 100%)' // Blue Grey
  ];
  
  // Banner images for class header
  const bannerImages = [
    'https://gstatic.com/classroom/themes/img_graduation.jpg',
    'https://gstatic.com/classroom/themes/img_bookclub.jpg',
    'https://gstatic.com/classroom/themes/img_code.jpg',
    'https://gstatic.com/classroom/themes/img_reachout.jpg',
    'https://gstatic.com/classroom/themes/Chemistry.jpg',
    'https://gstatic.com/classroom/themes/Math.jpg',
    'https://gstatic.com/classroom/themes/img_learnlanguage.jpg',
    'https://gstatic.com/classroom/themes/img_read.jpg',
    'https://gstatic.com/classroom/themes/Geography.jpg',
    'https://gstatic.com/classroom/themes/History.jpg',
    'https://gstatic.com/classroom/themes/Literature.jpg',
    'https://gstatic.com/classroom/themes/SocialStudies.jpg'
  ];
  
  // State for custom image upload
  const [customImageUrl, setCustomImageUrl] = useState('');
  
  const [selectedBanner, setSelectedBanner] = useState('');
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const [imageMenuAnchor, setImageMenuAnchor] = useState(null);
  
  // Generate a simple class code
  const generateClassCode = () => {
    // Generate a 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Update preview if courseName changes
    if (name === 'courseName' && value) {
      setPreviewBackground(getClassBackground(value));
      setPreviewInitials(getClassInitials(value));
    }
  };
  
  const handleColorMenuOpen = (event) => {
    setColorMenuAnchor(event.currentTarget);
  };

  const handleColorMenuClose = () => {
    setColorMenuAnchor(null);
  };

  const handleImageMenuOpen = (event) => {
    setImageMenuAnchor(event.currentTarget);
  };

  const handleImageMenuClose = () => {
    setImageMenuAnchor(null);
  };
  
  const selectThemeGradient = (gradient) => {
    setPreviewBackground(gradient);
    setSelectedBanner('');
    handleColorMenuClose();
  };
  
  const selectBannerImage = (imageUrl) => {
    setSelectedBanner(imageUrl);
    setPreviewBackground(''); // Clear gradient when image is selected
    handleImageMenuClose();
  };
  
  const handleCustomImageUrlChange = (e) => {
    setCustomImageUrl(e.target.value);
  };
  
  const applyCustomImage = () => {
    if (customImageUrl) {
      setSelectedBanner(customImageUrl);
      setPreviewBackground(''); // Clear gradient when image is selected
      handleImageMenuClose();
    }
  };
  
  // Update preview when component mounts or courseName changes
  useEffect(() => {
    if (formData.courseName) {
      setPreviewBackground(getClassBackground(formData.courseName));
      setPreviewInitials(getClassInitials(formData.courseName));
    }
  }, [formData.courseName]);
  
  // Generate a class code when the component mounts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      classCode: generateClassCode()
    }));
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseName.trim()) {
      setError('Course name is required');
      return;
    }
    
    // Check if we have a user (either real or mock)
    const currentUser = getUser();
    if (!currentUser || !currentUser.id) {
      // Create a temporary user if needed
      const tempUser = {
        id: 'temp-user-' + Date.now(),
        name: 'Temporary User',
        email: 'temp@example.com'
      };
      localStorage.setItem('user', JSON.stringify(tempUser));
      // Continue with the temporary user
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Get the current user (which might be the one we just created)
      const currentUser = getUser();
      
      // Prepare course data
      const courseData = {
        courseName: formData.courseName,
        section: formData.section,
        subject: formData.subject,
        room: formData.room,
        description: formData.description,
        classCode: formData.classCode,
        teacherId: currentUser.id,
        teacherName: currentUser.name || 'Teacher',
        createdBy: currentUser.id,
        isFolder: false,
        themeBackground: previewBackground,
        bannerImage: selectedBanner,
        createdAt: new Date().toISOString()
      };
      
      try {
        // Try to create course via API
        const response = await courseService.createCourse(courseData);
        console.log('Course created successfully:', response.data);
        
        // If API call succeeds, use the returned data
        if (response && response.data) {
          // Update local storage with new course
          const localCourses = JSON.parse(localStorage.getItem('userCourses') || '[]');
          // Add role information to indicate this user is the teacher
          const courseWithRole = {
            ...response.data,
            role: 'teacher',
            teacherId: currentUser.id,
            createdBy: currentUser.id
          };
          localCourses.push(courseWithRole);
          localStorage.setItem('userCourses', JSON.stringify(localCourses));
          console.log('Updated courses in localStorage:', localCourses);
        }
        
        // Show success and immediately redirect to dashboard
        setSuccess(true);
        navigate('/dashboard?newCourse=true');
        
      } catch (apiError) {
        // Fallback to client-side storage if API fails
        console.warn('API call failed, using client-side storage:', apiError);
        
        // Get existing courses/folders from localStorage
        const existingItems = JSON.parse(localStorage.getItem('userCourses') || '[]');
        
        // Generate a unique ID for the course
        const newCourseId = 'local-course-' + Date.now();
        
        // Create a complete course object with ID
        const newCourse = {
          id: newCourseId,
          ...courseData,
          teacherId: currentUser.id,
          createdBy: currentUser.id,
          role: 'teacher'
        };
        
        // Add the new course/folder
        existingItems.push(newCourse);
        
        // Save back to localStorage
        localStorage.setItem('userCourses', JSON.stringify(existingItems));
        
        console.log('Course saved to localStorage:', newCourse);
        console.log('All courses in localStorage:', existingItems);
      }
      
      // Show success and immediately redirect to dashboard
      setSuccess(true);
      navigate('/dashboard', { state: { newCourse: true } });
      
    } catch (err) {
      console.error('Error creating course/folder:', err);
      setError(`Failed to create ${formData.isFolder ? 'folder' : 'course'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  // All users can create classes now
  
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              Create class
            </Typography>
            <Box>
              <Button 
                variant="text" 
                color="inherit" 
                onClick={() => navigate('/dashboard')}
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                disabled={!formData.courseName.trim() || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Class created successfully! Redirecting to dashboard...</Alert>}
        
        <Grid container spacing={4}>
          {/* Left side - Class Preview */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ overflow: 'visible', borderRadius: '8px', height: '100%' }}>
              {selectedBanner ? (
                <CardMedia
                  sx={{
                    height: 140,
                    background: selectedBanner ? `url(${selectedBanner})` : previewBackground,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 500 }}>
                      {formData.courseName || 'Class name'}
                    </Typography>
                    {formData.section && (
                      <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {formData.section}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {user?.name || 'Teacher'}
                    </Typography>
                  </Box>
                </CardMedia>
              ) : (
                <Box sx={{
                  height: 96,
                  background: previewBackground,
                  position: 'relative',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -70%)',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: selectedBanner ? getClassBackground(formData.courseName || '') : previewBackground,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 500 }}>
                      {previewInitials}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 500 }}>
                    {formData.courseName || 'Class name'}
                  </Typography>
                  {formData.section && (
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {formData.section}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {user?.name || 'Teacher'}
                  </Typography>
                </Box>
              )}
              
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -3, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      sx={{ bgcolor: 'white', boxShadow: 1 }}
                      onClick={handleColorMenuOpen}
                    >
                      <PaletteIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ bgcolor: 'white', boxShadow: 1 }}
                      onClick={handleImageMenuOpen}
                    >
                      <ImageIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {formData.classCode && (
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    mb: 2, 
                    bgcolor: '#f9f9f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Class code
                      </Typography>
                      <Typography variant="h6">
                        {formData.classCode}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {formData.subject && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    <strong>Subject:</strong> {formData.subject}
                  </Typography>
                )}
                
                {formData.room && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    <strong>Room:</strong> {formData.room}
                  </Typography>
                )}
                
                {formData.description && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2">
                      {formData.description}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right side - Form */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ p: 3, borderRadius: '8px' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Class details
              </Typography>
              
              <form>
                <Stack spacing={3}>
                  <TextField
                    label="Class name (required)"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    placeholder="e.g., Biology 101"
                  />
                  
                  <TextField
                    label="Section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g., Period 1"
                  />
                  
                  <TextField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g., Science"
                  />
                  
                  <TextField
                    label="Room"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g., A-101"
                  />
                  
                  <TextField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Add a description for your class"
                  />
                  
                  <TextField
                    label="Class Code"
                    name="classCode"
                    value={formData.classCode}
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText="Share this code with students to join your class"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      } 
                    }}
                  />
                  

                </Stack>
              </form>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Color Theme Menu */}
      <Menu
        anchorEl={colorMenuAnchor}
        open={Boolean(colorMenuAnchor)}
        onClose={handleColorMenuClose}
      >
        <Box sx={{ p: 1, width: 220 }}>
          <Typography variant="subtitle2" sx={{ px: 1, mb: 1 }}>
            Select theme color
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {themeGradients.map((gradient) => (
              <Box
                key={gradient}
                onClick={() => selectThemeGradient(gradient)}
                sx={{
                  width: 40,
                  height: 40,
                  background: gradient,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: previewBackground === gradient ? '2px solid #000' : 'none',
                  '&:hover': { opacity: 0.8 }
                }}
              />
            ))}
          </Box>
        </Box>
      </Menu>
      
      {/* Image Theme Menu */}
      <Menu
        anchorEl={imageMenuAnchor}
        open={Boolean(imageMenuAnchor)}
        onClose={handleImageMenuClose}
      >
        <Box sx={{ p: 1, width: 320 }}>
          <Typography variant="subtitle2" sx={{ px: 1, mb: 1 }}>
            Select banner image
          </Typography>
          
          {/* Custom image URL input */}
          <Box sx={{ px: 1, mb: 2, display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Enter image URL"
              value={customImageUrl}
              onChange={handleCustomImageUrlChange}
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Button 
              variant="contained" 
              size="small" 
              onClick={applyCustomImage}
              disabled={!customImageUrl}
            >
              Apply
            </Button>
          </Box>
          
          {/* Predefined images */}
          <Typography variant="caption" sx={{ px: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
            Or choose from gallery:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {bannerImages.map((image) => (
              <Box
                key={image}
                onClick={() => selectBannerImage(image)}
                sx={{
                  width: 80,
                  height: 60,
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  border: selectedBanner === image ? '2px solid #1a73e8' : 'none',
                  borderRadius: 1,
                  '&:hover': { opacity: 0.8 }
                }}
              />
            ))}
          </Box>
        </Box>
      </Menu>
    </Box>
  );
};

export default CreateCourse;
