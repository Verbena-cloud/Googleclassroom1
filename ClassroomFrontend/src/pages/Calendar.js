import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Fab,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NoteAdd as NoteAddIcon
} from '@mui/icons-material';
// User-specific storage is handled in calendarUtils.js
import { saveNote, getNote, saveEvent, getEvents, deleteEvent, getEventsForDate } from '../utils/calendarUtils';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    course: '',
    type: 'assignment' // 'assignment', 'exam', 'meeting', 'other'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  // Get current user for user-specific storage
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names for display
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Load events from localStorage
  useEffect(() => {
    const loadedEvents = getEvents();
    setEvents(loadedEvents);
  }, []);

  // Handle opening the note dialog
  const handleOpenNoteDialog = (day) => {
    if (!day) return;
    
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    
    // Load existing note for this date
    const existingNote = getNote(date);
    setNoteText(existingNote);
    
    setNoteDialogOpen(true);
  };

  // Handle saving a note
  const handleSaveNote = () => {
    if (selectedDate) {
      saveNote(selectedDate, noteText);
      setNoteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Note saved successfully!',
        severity: 'success'
      });
    }
  };

  // Handle opening the event dialog
  const handleOpenEventDialog = (day, event = null) => {
    if (!day && !event) return;
    
    if (event) {
      // Edit existing event
      setSelectedEvent(event);
      setNewEvent({
        ...event,
        date: new Date(event.date)
      });
    } else {
      // Create new event
      const date = new Date(currentYear, currentMonth, day);
      setSelectedEvent(null);
      setNewEvent({
        title: '',
        description: '',
        date: date,
        course: '',
        type: 'assignment'
      });
    }
    
    setEventDialogOpen(true);
  };

  // Handle saving an event
  const handleSaveEvent = () => {
    const eventToSave = selectedEvent 
      ? { ...newEvent, id: selectedEvent.id } 
      : { ...newEvent };
      
    const savedEvent = saveEvent(eventToSave);
    
    // Update local state
    if (selectedEvent) {
      setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e));
    } else {
      setEvents([...events, savedEvent]);
    }
    
    setEventDialogOpen(false);
    setSnackbar({
      open: true,
      message: `Event ${selectedEvent ? 'updated' : 'created'} successfully!`,
      severity: 'success'
    });
  };

  // Handle deleting an event
  const handleDeleteEvent = (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      deleteEvent(event.id);
      setEvents(events.filter(e => e.id !== event.id));
      setSnackbar({
        open: true,
        message: 'Event deleted successfully!',
        severity: 'success'
      });
    }
  };

  // Check if a day has events
  const getEventsForDay = (day) => {
    if (!day) return [];
    
    const date = new Date(currentYear, currentMonth, day);
    return getEventsForDate(date);
  };
  
  // Check if a day has notes and return the note text
  const getNoteForDay = (day) => {
    if (!day) return '';
    
    const date = new Date(currentYear, currentMonth, day);
    return getNote(date);
  };
  
  // Check if a day has notes
  const hasNote = (day) => {
    const note = getNoteForDay(day);
    return note && note.trim().length > 0;
  };
  
  // Render calendar grid
  const renderCalendarGrid = () => {
    const days = generateCalendarDays();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    return (
      <Grid container spacing={1}>
        {/* Day headers */}
        {dayNames.map((day, index) => (
          <Grid item key={`header-${index}`} xs={12/7}>
            <Box sx={{ 
              textAlign: 'center', 
              fontWeight: 'bold', 
              p: 1,
              bgcolor: 'primary.light',
              color: 'white',
              borderRadius: 1
            }}>
              {day}
            </Box>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isCurrentMonth && day === today.getDate();
          
          return (
            <Grid item key={`day-${index}`} xs={12/7}>
              <Box 
                sx={{ 
                  height: 100, 
                  border: '1px solid #eee',
                  borderRadius: 1,
                  bgcolor: isToday ? 'primary.light' : 'background.paper',
                  color: isToday ? 'white' : 'text.primary',
                  p: 1,
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {day && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                        {day}
                      </Typography>
                      {hasNote(day) && (
                        <Tooltip 
                          title={
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Note Preview:
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {getNoteForDay(day).substring(0, 100)}
                                {getNoteForDay(day).length > 100 ? '...' : ''}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                                Click to view full note
                              </Typography>
                            </Box>
                          }
                          arrow
                        >
                          <IconButton 
                            size="small" 
                            color="primary" 
                            sx={{ p: 0 }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the cell click
                              handleOpenNoteDialog(day);
                            }}
                          >
                            <NoteAddIcon fontSize="small" sx={{ opacity: 0.7 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Box 
                      sx={{ 
                        mt: 1, 
                        overflow: 'hidden',
                        height: '70%',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenNoteDialog(day)}
                    >
                      {dayEvents.map(event => (
                        <Box 
                          key={event.id} 
                          sx={{ 
                            display: 'block',
                            bgcolor: event.type === 'exam' ? 'error.light' : 
                                    event.type === 'meeting' ? 'info.light' : 'secondary.light',
                            color: 'white',
                            p: 0.5,
                            borderRadius: 0.5,
                            mb: 0.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="caption" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {event.title}
                          </Typography>
                          <IconButton 
                            size="small" 
                            sx={{ color: 'white', p: 0, ml: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEventDialog(day, event);
                            }}
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Box>
                      ))}
                      {dayEvents.length === 0 && (
                        <Box 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            opacity: 0.3,
                            '&:hover': {
                              opacity: 0.7
                            }
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Click to add note
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Calendar
          </Typography>
          <Box>
            <IconButton onClick={goToPreviousMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={goToToday}>
              <TodayIcon />
            </IconButton>
            <IconButton onClick={goToNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="h5" sx={{ mb: 2 }}>
          {monthNames[currentMonth]} {currentYear}
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderCalendarGrid()}
        
        {/* Add Event FAB */}
        <Tooltip title="Add new event">
          <Fab 
            color="primary" 
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            onClick={() => handleOpenEventDialog(new Date().getDate())}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Events
          </Typography>
          <Grid container spacing={2}>
            {events.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  No upcoming events. Click the + button to add an event.
                </Typography>
              </Grid>
            ) : (
              events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3)
                .map(event => (
                  <Grid item xs={12} sm={4} key={event.id}>
                    <Card>
                      <CardHeader 
                        title={event.title}
                        subheader={`${new Date(event.date).toLocaleDateString()} • ${event.course || 'No course'}`}
                        action={
                          <IconButton onClick={() => handleDeleteEvent(event)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {event.description || 'No description available'}
                        </Typography>
                        <Button 
                          size="small" 
                          sx={{ mt: 1 }}
                          onClick={() => handleOpenEventDialog(null, event)}
                        >
                          Edit
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
            )}
          </Grid>
        </Box>
        
        {/* Note Dialog */}
        <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white' }}>
            {selectedDate ? `Notes for ${selectedDate.toLocaleDateString()}` : 'Add Note'}
          </DialogTitle>
          <DialogContent>
            {noteText && noteText.trim().length > 0 && (
              <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Current Note:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {noteText}
                </Typography>
              </Box>
            )}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              {noteText && noteText.trim().length > 0 ? 'Edit Note:' : 'Add a New Note:'}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="note"
              label="Your Note"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your notes here..."
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Notes are saved to your account and are only visible to you.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote} variant="contained" color="primary">
              Save Note
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Event Dialog */}
        <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              label="Event Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="date"
              label="Date"
              type="date"
              fullWidth
              variant="outlined"
              value={newEvent.date.toISOString().split('T')[0]}
              onChange={(e) => setNewEvent({...newEvent, date: new Date(e.target.value)})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="course"
              label="Course"
              type="text"
              fullWidth
              variant="outlined"
              value={newEvent.course}
              onChange={(e) => setNewEvent({...newEvent, course: e.target.value})}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="event-type-label">Event Type</InputLabel>
              <Select
                labelId="event-type-label"
                id="event-type"
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                label="Event Type"
              >
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="exam">Exam</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({...snackbar, open: false})}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default Calendar;
