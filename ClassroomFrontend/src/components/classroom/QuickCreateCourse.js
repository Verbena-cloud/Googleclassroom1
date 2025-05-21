import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';

const QuickCreateCourse = ({ open, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: '',
    section: '',
    subject: '',
    room: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.courseName.trim()) {
      setError('Course name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get current user
      const user = getUser();
      
      // Generate a random class code
      const generateClassCode = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
      
      // Create new course object
      const newCourse = {
        id: Date.now().toString(),
        name: formData.courseName,
        section: formData.section,
        subject: formData.subject,
        room: formData.room,
        description: formData.description,
        teacherId: user?.id,
        teacherName: user?.name || 'Teacher',
        courseCode: generateClassCode(),
        createdAt: new Date().toISOString(),
        role: 'teacher' // Set role as teacher since they're creating
      };
      
      // Save to localStorage
      const localCourses = JSON.parse(localStorage.getItem('userCourses') || '[]');
      localCourses.push(newCourse);
      localStorage.setItem('userCourses', JSON.stringify(localCourses));
      
      if (onSuccess) {
        onSuccess(newCourse);
      }
      
      // Close the dialog
      onClose();
      
      // Navigate to dashboard with success parameter
      navigate('/dashboard?newCourse=true');
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create New Course</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Course Name (required)"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            fullWidth
            required
            autoFocus
            placeholder="e.g., Biology 101"
          />
          
          <TextField
            label="Section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., Period 1"
          />
          
          <TextField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., Science"
          />
          
          <TextField
            label="Room"
            name="room"
            value={formData.room}
            onChange={handleChange}
            fullWidth
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
            placeholder="Add a description for your course"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickCreateCourse;
