import React, { useState } from 'react';
import { Avatar, Badge, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useUser } from '../../context/UserContext';
import '../../styles/profile.css';

interface ProfileAvatarProps {
  size?: number;
  showUploadButton?: boolean;
  className: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  size = 40,
  showUploadButton = true,
  className
}) => {
  const { user, profileImage, updateProfileImage } = useUser();
  const [isHovering, setIsHovering] = useState(false);

  // Get user initials for the avatar
  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload this to a server
    // For now, we'll just use a local URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        updateProfileImage(reader.result);
        // In a real app, you would save this to the server
        localStorage.setItem('profileImage', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className={`${className} profile-avatar-container`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          showUploadButton && isHovering ? (
            <IconButton
              component="label"
              className="profile-avatar-button"
              sx={{
                width: size / 3,
                height: size / 3
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: size / 5 }} />
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleFileUpload}
              />
            </IconButton>
          ) : null
        }
      >
        <Avatar
          src={profileImage || undefined}
          className={user?.role === 'Teacher' ? 'profile-avatar-teacher' : 'profile-avatar-student'}
          sx={{
            width: size,
            height: size,
            '--avatar-size': `${size}px`
          } as any}
        >
          {!profileImage && getInitials()}
        </Avatar>
      </Badge>
    </div>
  );
};

export default ProfileAvatar;
