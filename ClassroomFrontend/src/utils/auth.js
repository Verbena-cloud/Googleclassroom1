// Authentication utility functions

// Save token to local storage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Get token from local storage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Remove token from local storage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Save user data to local storage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user data from local storage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user data from local storage
export const removeUser = () => {
  localStorage.removeItem('user');
};

// Save profile image URL to local storage with user-specific key
export const setProfileImage = (imageUrl) => {
  const user = getUser();
  if (user && user.id) {
    localStorage.setItem(`profileImage_${user.id}`, imageUrl);
  } else {
    localStorage.setItem('profileImage', imageUrl); // Fallback for when user is not available
  }
};

// Get profile image URL from local storage with user-specific key
export const getProfileImage = () => {
  const user = getUser();
  if (user && user.id) {
    return localStorage.getItem(`profileImage_${user.id}`) || '/default-avatar.svg';
  }
  return localStorage.getItem('profileImage') || '/default-avatar.svg';
};

// Remove profile image URL from local storage with user-specific key
export const removeProfileImage = () => {
  const user = getUser();
  if (user && user.id) {
    localStorage.removeItem(`profileImage_${user.id}`);
  }
  localStorage.removeItem('profileImage'); // Clean up any old non-user-specific entries
};

// Update user profile data
export const updateUserProfile = (userData) => {
  const currentUser = getUser();
  if (currentUser) {
    setUser({ ...currentUser, ...userData });
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getToken() !== null;
};

// Logout - clear all auth data
export const logout = () => {
  removeToken();
  removeUser();
  removeProfileImage();
};
