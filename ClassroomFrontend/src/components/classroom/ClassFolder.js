import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Divider,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getClassColor } from '../../utils/classUtils';

/**
 * A component that displays a Google Classroom-like folder structure
 * for organizing class materials
 */
const ClassFolder = ({ course }) => {
  // State for folder dialog
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // State for file dialog
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('pdf');
  // File type selection for the file dialog
  const [selectedFileType, setSelectedFileType] = useState('pdf');
  // State for tracking which folder is being modified
  const [activeFolderId, setActiveFolderId] = useState(null);
  
  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Folder structure (in a real app, this would come from an API)
  const [folders, setFolders] = useState([
    {
      id: 1,
      name: 'Class Materials',
      expanded: false,
      files: [
        { id: 1, name: 'Syllabus.pdf', type: 'pdf' },
        { id: 2, name: 'Lecture Notes.docx', type: 'docx' }
      ]
    },
    {
      id: 2,
      name: 'Assignments',
      expanded: false,
      files: [
        { id: 3, name: 'Homework 1.pdf', type: 'pdf' },
        { id: 4, name: 'Project Guidelines.pdf', type: 'pdf' }
      ]
    },
    {
      id: 3,
      name: 'Resources',
      expanded: false,
      files: [
        { id: 5, name: 'Textbook.pdf', type: 'pdf' },
        { id: 6, name: 'Reference Guide.docx', type: 'docx' }
      ]
    }
  ]);

  // State for folder menu
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  // State for file menu
  const [fileMenuAnchorEl, setFileMenuAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setFolders(folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, expanded: !folder.expanded } 
        : folder
    ));
  };

  // Handle folder menu open
  const handleFolderMenuOpen = (event, folder) => {
    event.stopPropagation();
    setFolderMenuAnchorEl(event.currentTarget);
    setSelectedFolder(folder);
  };

  // Handle folder menu close
  const handleFolderMenuClose = () => {
    setFolderMenuAnchorEl(null);
    setSelectedFolder(null);
  };

  // Handle file menu open
  const handleFileMenuOpen = (event, file, folderId) => {
    event.stopPropagation();
    setFileMenuAnchorEl(event.currentTarget);
    setSelectedFile({ ...file, folderId });
  };

  // Handle file menu close
  const handleFileMenuClose = () => {
    setFileMenuAnchorEl(null);
    setSelectedFile(null);
  };
  
  // Download file
  const downloadFile = () => {
    if (selectedFile) {
      // In a real app, this would trigger a file download
      console.log(`Downloading file: ${selectedFile.name}`);
    }
    handleFileMenuClose();
  };

  // Open the folder dialog
  const openFolderDialog = () => {
    setNewFolderName('');
    setFolderDialogOpen(true);
  };
  
  // Close the folder dialog
  const closeFolderDialog = () => {
    setFolderDialogOpen(false);
  };
  
  // Add a new folder
  const addFolder = () => {
    if (folderDialogOpen) {
      // If dialog is open, use the name from the dialog
      if (!newFolderName.trim()) {
        setSnackbar({
          open: true,
          message: 'Folder name cannot be empty',
          severity: 'error'
        });
        return;
      }
      
      const newFolder = {
        id: Date.now(), // Use timestamp for unique ID
        name: newFolderName.trim(),
        expanded: false,
        files: []
      };
      setFolders([...folders, newFolder]);
      closeFolderDialog();
      
      setSnackbar({
        open: true,
        message: `Folder "${newFolderName}" created successfully`,
        severity: 'success'
      });
    } else {
      // Open the dialog if it's not open
      openFolderDialog();
    }
  };

  // Open the file dialog
  const openFileDialog = (folderId) => {
    setActiveFolderId(folderId);
    setNewFileName('');
    setNewFileType('pdf');
    setSelectedFileType('pdf');
    setFileDialogOpen(true);
    handleFolderMenuClose();
  };
  
  // Close the file dialog
  const closeFileDialog = () => {
    setFileDialogOpen(false);
    setActiveFolderId(null);
  };
  
  // Add a new file to a folder
  const addFile = () => {
    const folderId = activeFolderId;
    if (!newFileName.trim()) {
      setSnackbar({
        open: true,
        message: 'File name is required',
        severity: 'error'
      });
      return;
    }

    const folderIndex = folders.findIndex(f => f.id === folderId);
    if (folderIndex === -1) return;

    const newFile = {
      id: Date.now(),
      name: newFileName.trim(),
      type: selectedFileType,
      dateAdded: new Date().toISOString(),
      size: '250KB' // Simplified mock file size
    };

    const updatedFolders = [...folders];
    updatedFolders[folderIndex].files.push(newFile);
    setFolders(updatedFolders);
    setNewFileName('');
    setSelectedFileType('pdf');
    setFileDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: `File "${newFile.name}" added`,
      severity: 'success'
    });
  };

  // Delete a folder
  const deleteFolder = (folderId) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
    handleFolderMenuClose();
    
    setSnackbar({
      open: true,
      message: 'Folder deleted',
      severity: 'success'
    });
  };
  
  // Delete a file
  const deleteFile = () => {
    if (selectedFile) {
      const { folderId, id } = selectedFile;
      const folder = folders.find(f => f.id === folderId);
      
      if (folder) {
        setFolders(folders.map(f => 
          f.id === folderId 
            ? { ...f, files: f.files.filter(file => file.id !== id) } 
            : f
        ));
        
        setSnackbar({
          open: true,
          message: `File "${selectedFile.name}" deleted`,
          severity: 'success'
        });
      }
    }
    handleFileMenuClose();
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Get the appropriate icon for a file based on its type
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <InsertDriveFileIcon sx={{ color: '#E44D26' }} />;
      case 'docx':
        return <InsertDriveFileIcon sx={{ color: '#2A5699' }} />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  // Get the class color for the header with fallback
  const headerColor = course?.courseName ? getClassColor(course.courseName) : '#4285F4';

  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={1} sx={{ borderRadius: 1, overflow: 'hidden' }}>
        {/* Header */}
        <Box 
          sx={{ 
            bgcolor: headerColor, 
            color: 'white', 
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6">
            {course?.courseName || 'Class'} Files
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={addFolder}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
            }}
          >
            Add Folder
          </Button>
        </Box>

        {/* Folder List */}
        <List sx={{ p: 0 }}>
          {folders.map((folder) => (
            <React.Fragment key={folder.id}>
              <ListItem 
                button 
                onClick={() => toggleFolder(folder.id)}
                sx={{ 
                  py: 1.5,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                }}
              >
                <ListItemIcon>
                  <FolderIcon sx={{ color: headerColor }} />
                </ListItemIcon>
                <ListItemText 
                  primary={folder.name} 
                  secondary={`${folder.files.length} files`}
                />
                <IconButton 
                  edge="end" 
                  onClick={(e) => handleFolderMenuOpen(e, folder)}
                  sx={{ mr: 1 }}
                >
                  <MoreVertIcon />
                </IconButton>
                {folder.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              
              <Collapse in={folder.expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {folder.files.map((file) => (
                    <ListItem 
                      key={file.id} 
                      button
                      sx={{ pl: 4, py: 1 }}
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText primary={file.name} />
                      <IconButton 
                        edge="end" 
                        onClick={(e) => handleFileMenuOpen(e, file, folder.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                  {folder.files.length === 0 && (
                    <ListItem sx={{ pl: 4, py: 1 }}>
                      <ListItemText 
                        primary="No files in this folder" 
                        primaryTypographyProps={{ color: 'text.secondary', fontStyle: 'italic' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
          
          {folders.length === 0 && (
            <ListItem sx={{ py: 3 }}>
              <ListItemText 
                primary="No folders yet" 
                secondary="Click 'Add Folder' to create your first folder"
                primaryTypographyProps={{ align: 'center' }}
                secondaryTypographyProps={{ align: 'center' }}
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Folder Menu */}
      {/* Folder Menu */}
      <Menu
        anchorEl={folderMenuAnchorEl}
        open={Boolean(folderMenuAnchorEl)}
        onClose={handleFolderMenuClose}
      >
        <MenuItem onClick={() => openFileDialog(selectedFolder?.id)}>Add File</MenuItem>
        <MenuItem onClick={handleFolderMenuClose}>Rename</MenuItem>
        <MenuItem onClick={() => deleteFolder(selectedFolder?.id)}>Delete</MenuItem>
      </Menu>

      {/* File Menu */}
      <Menu
        anchorEl={fileMenuAnchorEl}
        open={Boolean(fileMenuAnchorEl)}
        onClose={handleFileMenuClose}
      >
        <MenuItem onClick={downloadFile}>Download</MenuItem>
        <MenuItem onClick={handleFileMenuClose}>Rename</MenuItem>
        <MenuItem onClick={deleteFile}>Delete</MenuItem>
      </Menu>
      
      {/* New Folder Dialog */}
      <Dialog open={folderDialogOpen} onClose={closeFolderDialog}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFolderDialog}>Cancel</Button>
          <Button onClick={addFolder} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New File Dialog */}
      <Dialog open={fileDialogOpen} onClose={closeFileDialog}>
        <DialogTitle>Add New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="File Type"
            value={newFileType}
            onChange={(e) => setNewFileType(e.target.value)}
            fullWidth
            variant="outlined"
          >
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="docx">Word Document</MenuItem>
            <MenuItem value="xlsx">Excel Spreadsheet</MenuItem>
            <MenuItem value="pptx">PowerPoint</MenuItem>
            <MenuItem value="txt">Text File</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFileDialog}>Cancel</Button>
          <Button onClick={addFile} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default ClassFolder;
