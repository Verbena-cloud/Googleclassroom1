import React, { useState, useEffect } from 'react';
import Announcement from './Announcement';
import { announcementService } from '../../services/api';
import './AnnouncementList.css';

const AnnouncementList = ({ courseId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAnnouncementIds, setNewAnnouncementIds] = useState(new Set());

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await announcementService.getCourseAnnouncements(courseId);
        
        // Sort announcements by date (newest first)
        const sortedAnnouncements = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setAnnouncements(sortedAnnouncements);
        
        // Store the current announcement IDs to detect new ones later
        const currentIds = new Set(sortedAnnouncements.map(a => a.announcementID));
        
        // Check for new announcements every minute
        const intervalId = setInterval(async () => {
          try {
            const newResponse = await announcementService.getCourseAnnouncements(courseId);
            const newSortedAnnouncements = newResponse.data.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            // Find new announcements
            const newIds = new Set();
            newSortedAnnouncements.forEach(announcement => {
              if (!currentIds.has(announcement.announcementID)) {
                newIds.add(announcement.announcementID);
              }
            });
            
            // Update state with new announcements
            if (newIds.size > 0) {
              setAnnouncements(newSortedAnnouncements);
              setNewAnnouncementIds(newIds);
              
              // After 5 seconds, clear the "new" status
              setTimeout(() => {
                setNewAnnouncementIds(new Set());
              }, 5000);
            }
          } catch (err) {
            console.error("Error checking for new announcements:", err);
          }
        }, 60000); // Check every minute
        
        return () => clearInterval(intervalId);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAnnouncements();
    }
  }, [courseId]);

  if (loading) {
    return <div className="announcement-loading">Loading announcements...</div>;
  }

  if (error) {
    return <div className="announcement-error">{error}</div>;
  }

  if (announcements.length === 0) {
    return <div className="no-announcements">No announcements yet</div>;
  }

  return (
    <div className="announcements-list">
      {announcements.map((announcement, index) => (
        <Announcement 
          key={announcement.announcementID} 
          announcement={announcement}
          isNew={newAnnouncementIds.has(announcement.announcementID)}
        />
      ))}
    </div>
  );
};

export default AnnouncementList;
