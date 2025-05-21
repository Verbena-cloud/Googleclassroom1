import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUser, getProfileImage } from '../utils/auth';

// Create context
const UserContext = createContext();

// Create provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [profileImage, setProfileImage] = useState(getProfileImage());

  // Update context when localStorage changes
  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  const updateProfileImage = (imageUrl) => {
    setProfileImage(imageUrl);
    // Force a re-render of all components using the profile image
    window.dispatchEvent(new Event('storage'));
  };

  // Listen for storage events (when localStorage changes)
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUser());
      setProfileImage(getProfileImage());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      profileImage, 
      updateProfileImage 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
