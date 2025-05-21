import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUser, getProfileImage } from '../utils/auth';
import { User, UserContextType } from '../types';

// Create context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

// Create provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUser());
  const [profileImage, setProfileImage] = useState<string | null>(getProfileImage());

  // Update context when localStorage changes
  const updateUser = (newUserData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...newUserData } : null);
  };

  const updateProfileImage = (imageUrl: string) => {
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
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
