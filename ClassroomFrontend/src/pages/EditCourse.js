import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const user = getUser();
  
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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Load course data when component mounts
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // If course data was passed via location state, use that
        if (location.state?.course) {
          const course = location.state.course;
          setFormData({
            courseName: course.courseName || '',
            section: course.section || '',
            subject: course.subject || '',
            room: course.room || '',
            classCode: course.classCode || '',
            description: course.description || ''
          });
          
          // Set preview background and banner if available
          if (course.themeBackground) {
            setPreviewBackground(course.themeBackground);
          } else if (course.themeColor) {
            // For backward compatibility with older courses that use themeColor
            setPreviewBackground(`linear-gradient(135deg, ${course.themeColor} 0%, ${course.themeColor} 100%)`);
          } else {
            // Use class name to generate a background
            setPreviewBackground(getClassBackground(course.courseName || ''));
          }
          
          if (course.bannerImage) {
            setSelectedBanner(course.bannerImage);
          }
          
          setPreviewInitials(getClassInitials(course.courseName));
        } else {
          // Otherwise fetch from API
          const response = await courseService.getCourseById(id);
          const course = response.data;
          
          setFormData({
            courseName: course.courseName || '',
            section: course.section || '',
            subject: course.subject || '',
            room: course.room || '',
            classCode: course.classCode || '',
            description: course.description || ''
          });
          
          // Set preview background and banner if available
          if (course.themeBackground) {
            setPreviewBackground(course.themeBackground);
          } else if (course.themeColor) {
            // For backward compatibility with older courses that use themeColor
            setPreviewBackground(`linear-gradient(135deg, ${course.themeColor} 0%, ${course.themeColor} 100%)`);
          } else {
            // Use class name to generate a background
            setPreviewBackground(getClassBackground(course.courseName || ''));
          }
          
          if (course.bannerImage) {
            setSelectedBanner(course.bannerImage);
          }
          
          setPreviewInitials(getClassInitials(course.courseName));
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCourseData();
    }
  }, [id, location.state]);
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Update preview if courseName changes
    if (name === 'courseName' && value) {
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
    setSelectedBanner(''); // Clear banner when gradient is selected
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseName.trim()) {
      setError('Course name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare course data for update
      const courseData = {
        ...formData,
        themeBackground: selectedBanner ? null : previewBackground,
        bannerImage: selectedBanner,
      };
      
      try {
        // Try to update course via API
        const response = await courseService.updateCourse(id, courseData);
        console.log('Course updated successfully:', response.data);
        
        // If API call succeeds, update local storage
        if (response && response.data) {
          // Get existing courses from localStorage
          const localCourses = JSON.parse(localStorage.getItem('userCourses') || '[]');
          
          // Find and update the course
          const updatedCourses = localCourses.map(course => {
            if (course.id === id) {
              return { ...course, ...courseData };
            }
            return course;
          });
          
          // Save back to localStorage
          localStorage.setItem('userCourses', JSON.stringify(updatedCourses));
        }
      } catch (apiError) {
        console.warn('API call failed, updating client-side storage:', apiError);
        
        // Get existing courses from localStorage
        const localCourses = JSON.parse(localStorage.getItem('userCourses') || '[]');
        
        // Find and update the course
        const updatedCourses = localCourses.map(course => {
          if (course.id === id) {
            return { ...course, ...courseData };
          }
          return course;
        });
        
        // Save back to localStorage
        localStorage.setItem('userCourses', JSON.stringify(updatedCourses));
      }
      
      // Show success and redirect
      setSuccess(true);
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !formData.courseName) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            aria-label="back"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Edit class
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Course updated successfully!</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={1} sx={{ p: 3, borderRadius: '8px' }}>
              <form onSubmit={handleSubmit}>
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
                </Stack>
              </form>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={1} sx={{ overflow: 'visible', borderRadius: '8px', height: '100%' }}>
              <CardMedia
                sx={{
                  height: 140,
                  background: selectedBanner ? 
                    `url(${selectedBanner})` : 
                    previewBackground,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  display: 'flex',
                  p: 1
                }}>
                  <IconButton 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.5)', 
                      mr: 1,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                    }}
                    onClick={handleColorMenuOpen}
                  >
                    <PaletteIcon />
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.5)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                    }}
                    onClick={handleImageMenuOpen}
                  >
                    <ImageIcon />
                  </IconButton>
                </Box>
              </CardMedia>
              
              <CardContent>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: selectedBanner ? 
                        previewBackground || getClassBackground(formData.courseName || '') : 
                        previewBackground,
                      color: 'white',
                      fontWeight: 'bold',
                      mr: 2
                    }}
                  >
                    {previewInitials}
                  </Box>
                  <Typography variant="h6">
                    {formData.courseName || 'Class Name'}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {formData.section || 'Section'} • {formData.subject || 'Subject'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {formData.description || 'Class description will appear here.'}
                </Typography>
              </CardContent>
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

export default EditCourse;
