import React, { useRef } from 'react';
import { Avatar, Badge, IconButton, Tooltip } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { getUser, setProfileImage } from '../../utils/auth';
import { useUser } from '../../context/UserContext';

const ProfileAvatar = ({ size = 40, showUploadButton = true, className }) => {
  const { profileImage, updateProfileImage } = useUser();
  const fileInputRef = useRef(null);
  const user = getUser();

  const handleAvatarClick = () => {
    if (showUploadButton && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Create a temporary URL for immediate display
      const tempUrl = URL.createObjectURL(file);
      
     
      
      // For now, just save the local file reference
      setProfileImage(tempUrl);
      updateProfileImage(tempUrl);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      // No need to revert, the context will maintain the previous state
    }
  };

  return (
    <>
      {showUploadButton ? (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Tooltip title="Upload profile picture">
              <IconButton 
                onClick={handleAvatarClick}
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: size / 3,
                  height: size / 3,
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: size / 5 }} />
              </IconButton>
            </Tooltip>
          }
        >
          <Avatar
            src={profileImage}
            alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
            sx={{ width: size, height: size }}
            className={className}
          />
        </Badge>
      ) : (
        <Avatar
          src={profileImage}
          alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
          sx={{ width: size, height: size }}
          className={className}
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
};

export default ProfileAvatar;
