import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Container,
  Divider,
  CssBaseline,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import JoinFullIcon from '@mui/icons-material/JoinFull';
import ProfileAvatar from '../profile/ProfileAvatar';
import { logout, isAuthenticated, getUser } from '../../utils/auth';

const AppLayout = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();
  
  // State for plus menu
  const [plusAnchorEl, setPlusAnchorEl] = useState(null);
  const isPlusMenuOpen = Boolean(plusAnchorEl);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handlePlusMenuOpen = (event) => {
    setPlusAnchorEl(event.currentTarget);
  };
  
  const handlePlusMenuClose = () => {
    setPlusAnchorEl(null);
  };
  
  const handleCreateClass = () => {
    handlePlusMenuClose();
    navigate('/courses/create');
  };
  
  const handleJoinClass = () => {
    handlePlusMenuClose();
    navigate('/join-class');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'Enrolled', icon: <ClassIcon />, path: '/courses' },
    { text: 'To-do', icon: <AssignmentIcon />, path: '/assignments' },
    { divider: true },
    { text: 'Archived classes', icon: <AnnouncementIcon />, path: '/archived' },
    { text: 'Settings', icon: <AccountCircleIcon />, path: '/profile' },
  ];

  const drawer = (
    <div>
      <Divider sx={{ mt: 2 }} />
      <List>
        {menuItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          ) : (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '0 25px 25px 0',
                mx: 1,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          )
        ))}
        {authenticated && (
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              borderRadius: '0 25px 25px 0',
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0'
        }}
        color="default"
      >
        <Toolbar>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Avatar 
              src="/classroom-icon.svg" 
              alt="Classroom" 
              variant="square"
              sx={{ width: 32, height: 32, mr: 1 }} 
            />
            <Typography variant="h6" component="div">
              Classroom
            </Typography>
          </Box>
          {authenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Create or join class">
                <IconButton 
                  color="primary" 
                  onClick={handlePlusMenuOpen}
                  size="large"
                  sx={{ mr: 2 }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={plusAnchorEl}
                open={isPlusMenuOpen}
                onClose={handlePlusMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleCreateClass}>
                  <ListItemIcon>
                    <AddCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Create class</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleJoinClass}>
                  <ListItemIcon>
                    <JoinFullIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Join class</ListItemText>
                </MenuItem>
              </Menu>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <ProfileAvatar size={32} showUploadButton={false} />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
              </Box>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Box>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Static sidebar */}
      {authenticated && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: 240, 
              boxSizing: 'border-box',
              borderRight: 'none',
              mt: 8
            },
          }}
        >
          {/* No need for extra Toolbar spacing */}
          {drawer}
        </Drawer>
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: 9, // Increased top margin to prevent content from being too close to navbar
          ml: 2, // Added left margin to create space from sidebar
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
