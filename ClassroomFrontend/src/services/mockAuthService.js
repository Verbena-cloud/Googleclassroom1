// Mock authentication service for development
// This will be replaced with real API calls in production

// Generate a unique ID for users
const generateUniqueId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Mock user database - initialize with some default users
let mockUsers = {};

// Add default users if localStorage doesn't have any users saved
const initializeMockUsers = () => {
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
      userType: 'Student'
    },
    'teacher@example.com': {
      id: 'user_teacher_001',
      email: 'teacher@example.com',
      password: 'password123',
      firstName: 'Teacher',
      lastName: 'User',
      userType: 'Teacher'
    }
  };
  
  // Save to localStorage
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
};

// Initialize mock users
initializeMockUsers();

// Mock login function
export const mockLogin = (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Mock login called with:', credentials);
      console.log('Available mock users:', Object.keys(mockUsers));
      
      const { Email, Password } = credentials;
      const normalizedEmail = Email.toLowerCase();
      const user = mockUsers[normalizedEmail];
      
      // For debugging - log the user lookup
      console.log('Looking up user with email:', normalizedEmail);
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (user && user.password === Password) {
        // Create a copy of the user without the password
        const { password, ...userWithoutPassword } = user;
        
        // Generate a mock token
        const token = 'mock_token_' + Math.random().toString(36).substr(2, 16);
        
        console.log('Login successful for user:', userWithoutPassword.email);
        
        resolve({
          data: {
            token,
            user: userWithoutPassword
          }
        });
      } else {
        // For testing purposes, let's provide a default login if no users exist
        if (Object.keys(mockUsers).length === 0 && Email === 'test@example.com' && Password === 'password') {
          const defaultUser = {
            id: generateUniqueId(),
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            userType: 'Student'
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
              token,
              user: defaultUser
            }
          });
          return;
        }
        
        console.log('Login failed: Invalid credentials');
        reject({
          response: {
            data: {
              message: 'Invalid email or password'
            }
          }
        });
      }
    }, 500); // Simulate network delay
  });
};

// Mock register function
export const mockRegister = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { Email } = userData;
      
      // Check if user already exists
      if (mockUsers[Email]) {
        reject({
          response: {
            data: {
              message: 'User with this email already exists'
            }
          }
        });
        return;
      }
      
      // Create new user with unique ID
      const newUser = {
        ...userData,
        id: generateUniqueId(),
        email: Email.toLowerCase(), // Store lowercase email for consistency
        password: userData.Password // Store password for mock login
      };
      
      // Add to mock database
      mockUsers[Email.toLowerCase()] = newUser;
      
      // Save updated users to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      
      // Return success without password
      const { password, Password, ...userWithoutPassword } = newUser;
      
      resolve({
        data: {
          message: 'Registration successful',
          user: userWithoutPassword,
          token: 'mock_token_' + Math.random().toString(36).substr(2, 16)
        }
      });
    }, 500); // Simulate network delay
  });
};

// Mock get current user function
export const mockGetCurrentUser = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app, this would verify the token and return the user
      // For mock purposes, we'll just return a success
      resolve({
        data: {
          message: 'User authenticated'
        }
      });
    }, 300);
  });
};
