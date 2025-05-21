// Mock authentication service for development
// This will be replaced with real API calls in production
import { AxiosResponse } from 'axios';
import { User } from '../types/index';
import { LoginCredentials, RegisterData, ApiResponse } from '../types/api';

interface MockUser extends User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface MockUserDatabase {
  [email: string]: MockUser;
}

// Generate a unique ID for users
const generateUniqueId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Mock user database - initialize with some default users
let mockUsers: MockUserDatabase = {};

// Add default users if localStorage doesn't have any users saved
const initializeMockUsers = (): void => {
  // Check if we already have users in localStorage
  const savedUsers = localStorage.getItem('mockUsers');
  if (savedUsers) {
    mockUsers = JSON.parse(savedUsers);
    return;
  }
  
  // Otherwise, set up default users
  mockUsers = {
    'student@example.com': {
      id: 'user_student_001',
      email: 'student@example.com',
      password: 'password123',
      firstName: 'Student',
      lastName: 'User',
      role: 'Student'
    },
    'teacher@example.com': {
      id: 'user_teacher_001',
      email: 'teacher@example.com',
      password: 'password123',
      firstName: 'Teacher',
      lastName: 'User',
      role: 'Teacher'
    }
  };
  
  // Save to localStorage
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
};

// Initialize mock users
initializeMockUsers();

// Mock login function
export const mockLogin = (credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse<User>>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Mock login called with:', credentials);
      console.log('Available mock users:', Object.keys(mockUsers));
      
      const { email, password } = credentials;
      const normalizedEmail = email.toLowerCase();
      const user = mockUsers[normalizedEmail];
      
      // For debugging - log the user lookup
      console.log('Looking up user with email:', normalizedEmail);
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (user && user.password === password) {
        // Create a copy of the user without the password
        const { password: _, ...userWithoutPassword } = user;
        
        // Generate a mock token
        const token = 'mock_token_' + Math.random().toString(36).substr(2, 16);
        
        console.log('Login successful for user:', userWithoutPassword.email);
        
        resolve({
          data: {
            data: {
              ...userWithoutPassword,
              token
            },
            status: 200,
            message: 'Login successful'
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any
        });
      } else {
        // For testing purposes, let's provide a default login if no users exist
        if (Object.keys(mockUsers).length === 0 && email === 'test@example.com' && password === 'password') {
          const defaultUser = {
            id: generateUniqueId(),
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'Student'
          };
          
          // Add to mock database for future logins
          mockUsers['test@example.com'] = {
            ...defaultUser,
            password: 'password'
          };
          
          // Save to localStorage
          localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
          
          const token = 'mock_token_' + Math.random().toString(36).substr(2, 16);
          
          console.log('Created default test user and logged in');
          
          resolve({
            data: {
              data: {
                ...defaultUser,
                token
              },
              status: 200,
              message: 'Login successful'
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any
          });
          return;
        }
        
        console.log('Login failed: Invalid credentials');
        reject({
          response: {
            data: {
              message: 'Invalid email or password',
              status: 401
            },
            status: 401
          }
        });
      }
    }, 500); // Simulate network delay
  });
};

// Mock register function
export const mockRegister = (userData: RegisterData): Promise<AxiosResponse<ApiResponse<User>>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { email } = userData;
      
      // Check if user already exists
      if (mockUsers[email.toLowerCase()]) {
        reject({
          response: {
            data: {
              message: 'User with this email already exists',
              status: 400
            },
            status: 400
          }
        });
        return;
      }
      
      // Create new user with unique ID
      const newUser: MockUser = {
        id: generateUniqueId(),
        email: email.toLowerCase(), // Store lowercase email for consistency
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        role: 'Student' // Default role
      };
      
      // Add to mock database
      mockUsers[email.toLowerCase()] = newUser;
      
      // Save updated users to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      
      // Return success without password
      const { password, ...userWithoutPassword } = newUser;
      const token = 'mock_token_' + Math.random().toString(36).substr(2, 16);
      
      resolve({
        data: {
          data: {
            ...userWithoutPassword,
            token
          },
          status: 201,
          message: 'Registration successful'
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      });
    }, 500); // Simulate network delay
  });
};

// Mock get current user function
export const mockGetCurrentUser = (): Promise<AxiosResponse<ApiResponse<User>>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app, this would verify the token and return the user
      // For mock purposes, we'll just return a success
      resolve({
        data: {
          data: {} as User, // Empty user object
          status: 200,
          message: 'User authenticated'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });
    }, 300);
  });
};
