import { getUser } from './auth';

// Format date to YYYY-MM-DD for storage keys
const formatDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Get user-specific storage key prefix
const getUserStoragePrefix = () => {
  const user = getUser();
  return user && user.id ? `calendar_${user.id}_` : 'calendar_';
};

// Save a note for a specific date
export const saveNote = (date, note) => {
  const dateKey = formatDateKey(date);
  const storageKey = `${getUserStoragePrefix()}note_${dateKey}`;
  localStorage.setItem(storageKey, note);
};

// Get a note for a specific date
export const getNote = (date) => {
  const dateKey = formatDateKey(date);
  const storageKey = `${getUserStoragePrefix()}note_${dateKey}`;
  return localStorage.getItem(storageKey) || '';
};

// Save an event for a specific date
export const saveEvent = (event) => {
  // Get existing events
  const events = getEvents();
  
  // Check if event already exists (for updates)
  const existingIndex = events.findIndex(e => e.id === event.id);
  
  if (existingIndex >= 0) {
    // Update existing event
    events[existingIndex] = event;
  } else {
    // Add new event with generated ID if not provided
    if (!event.id) {
      event.id = Date.now(); // Simple ID generation
    }
    events.push(event);
  }
  
  // Save back to localStorage
  localStorage.setItem(`${getUserStoragePrefix()}events`, JSON.stringify(events));
  
  return event;
};

// Get all events
export const getEvents = () => {
  const storageKey = `${getUserStoragePrefix()}events`;
  const eventsJson = localStorage.getItem(storageKey);
  
  if (!eventsJson) {
    return [];
  }
  
  try {
    const events = JSON.parse(eventsJson);
    
    // Convert date strings back to Date objects
    return events.map(event => ({
      ...event,
      date: new Date(event.date)
    }));
  } catch (error) {
    console.error('Error parsing events:', error);
    return [];
  }
};

// Delete an event
export const deleteEvent = (eventId) => {
  const events = getEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  localStorage.setItem(`${getUserStoragePrefix()}events`, JSON.stringify(filteredEvents));
};

// Get events for a specific date
export const getEventsForDate = (date) => {
  const events = getEvents();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === year &&
      eventDate.getMonth() === month &&
      eventDate.getDate() === day
    );
  });
};

// Get events for a specific month
export const getEventsForMonth = (year, month) => {
  const events = getEvents();
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === year &&
      eventDate.getMonth() === month
    );
  });
};
