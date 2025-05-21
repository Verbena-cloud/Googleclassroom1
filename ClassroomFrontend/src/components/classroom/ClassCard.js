import React from 'react';
import { 
  Card, 
  Box, 
  Typography, 
  IconButton, 
  Avatar,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SubjectIcon from '@mui/icons-material/Subject';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useNavigate } from 'react-router-dom';
import { getClassColor, getClassInitials } from '../../utils/classUtils';

/**
 * A reusable class card component that displays a class or folder with a dynamic circular avatar
 */
const ClassCard = ({ course, onMenuOpen, onFolderClick }) => {
  const navigate = useNavigate();
  // Use default empty object if course is undefined
  const courseData = course || {};
  const { courseName, section, teacherName, subject, room, id, isFolder } = courseData;
  
  // Generate class color and initials with fallbacks
  // Use a specific color for folders
  const bgColor = isFolder ? '#FFA000' : (courseName ? getClassColor(courseName) : '#4285F4');
  const initials = courseName ? getClassInitials(courseName) : '?';
  
  // Handle card click to navigate to class view or open folder
  const handleCardClick = () => {
    // Only navigate if we have a course/folder
    if (courseData) {
      if (isFolder && typeof onFolderClick === 'function') {
        // Open folder
        onFolderClick(id);
      } else {
        // Navigate to class view page
        navigate(`/class/${id || 'preview'}`);
      }
    }
  };
  
  // Handle menu click without triggering card click
  const handleMenuClick = (e) => {
    e.stopPropagation();
    if (typeof onMenuOpen === 'function') {
      onMenuOpen(e, courseData);
    }
  };
  
  return (
    <Card 
      sx={{ 
        borderRadius: 1, 
        overflow: 'hidden', 
        position: 'relative', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
      onClick={handleCardClick}
    >
      {/* Colored header */}
      <Box
        sx={{ 
          bgcolor: bgColor, 
          color: 'white',
          p: 2,
          position: 'relative',
          borderTopLeftRadius: 1,
          borderTopRightRadius: 1,
          height: '120px'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {courseName}
            </Typography>
            {section && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {section}
              </Typography>
            )}
            {teacherName && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                {teacherName}
              </Typography>
            )}
          </Box>
          <IconButton 
            aria-label="settings" 
            sx={{ color: 'white', p: 0.5 }}
            onClick={handleMenuClick}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        {/* Avatar with class initials or folder icon */}
        <Avatar
          sx={{
            bgcolor: '#ffffff',
            color: bgColor,
            width: 60,
            height: 60,
            position: 'absolute',
            bottom: -30,
            right: 24,
            border: '2px solid white',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {isFolder ? <FolderIcon /> : initials}
        </Avatar>
      </Box>
      
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Footer with icons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 1,
          borderTop: '1px solid #eee'
        }}
      >
        {!isFolder && (
          <>
            {/* Show subject icon if available */}
            {subject && (
              <Tooltip title={`Subject: ${subject}`}>
                <IconButton size="small">
                  <SubjectIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {/* Show room icon if available */}
            {room && (
              <Tooltip title={`Room: ${room}`}>
                <IconButton size="small">
                  <MeetingRoomIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <IconButton size="small">
              <PeopleIcon />
            </IconButton>
          </>
        )}
        
        <IconButton size="small">
          {isFolder ? <FolderOpenIcon /> : <FolderIcon />}
        </IconButton>
      </Box>
    </Card>
  );
};

export default ClassCard;
