// User related types
export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  token?: string;
}

// Form data types
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

// Context types
export interface UserContextType {
  user: User | null;
  updateUser: (userData: Partial<User>) => void;
  profileImage: string | null;
  updateProfileImage: (imageUrl: string) => void;
}
