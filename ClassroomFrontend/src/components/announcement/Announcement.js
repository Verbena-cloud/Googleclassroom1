import React, { useState, useEffect } from 'react';
import './Announcement.css';

const Announcement = ({ announcement, isNew = false }) => {
  const [show, setShow] = useState(false);
  
  // Trigger the animation after component mounts
  useEffect(() => {
    // Small delay to ensure the CSS transition works properly
    const timer = setTimeout(() => {
      setShow(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`announcement-container ${show ? 'show' : ''} ${isNew ? 'new' : ''}`}>
      <div className="announcement-header">
        <div className="announcement-author">
          <img 
            src={announcement.teacher?.profileImage || '/default-avatar.png'} 
            alt={announcement.teacher?.name || 'Teacher'} 
            className="author-avatar"
          />
          <div className="author-info">
            <h3>{announcement.teacher?.name || 'Teacher'}</h3>
            <span className="announcement-date">{formatDate(announcement.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="announcement-content">
        <h2 className="announcement-title">{announcement.title}</h2>
        <div className="announcement-text">{announcement.content}</div>
      </div>
      
      {announcement.attachments && announcement.attachments.length > 0 && (
        <div className="announcement-attachments">
          <h4>Attachments</h4>
          <ul>
            {announcement.attachments.map((attachment, index) => (
              <li key={index} className="attachment-item">
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  {attachment.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Announcement;
