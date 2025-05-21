import axios from 'axios';
// Import mock authentication services for development
import { mockLogin, mockRegister, mockGetCurrentUser } from './mockAuthService';

// API URL for the backend connected to SQL Server
const API_URL = 'http://localhost:5114/api';
console.log('API URL:', API_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configuration for mock services

// Set to false to use real backend with SQL Server database
const USE_MOCK_SERVICES = false; // We're now using the real backend with SSMS

// Authentication services
export const authService = {
  register: async (userData) => {
    console.log('Registering user with data:', userData);
    if (USE_MOCK_SERVICES) {
      return await mockRegister(userData);
    }
    return await api.post('/Auth/register', userData);
  },
  login: async (credentials) => {
    console.log('Logging in with credentials:', credentials);
    if (USE_MOCK_SERVICES) {
      return await mockLogin(credentials);
    }
    return await api.post('/Auth/login', credentials);
  },
  getCurrentUser: async () => {
    if (USE_MOCK_SERVICES) {
      return await mockGetCurrentUser();
    }
    return await api.get('/Users/current');
  }
};

// User services
export const userService = {
  getAllUsers: () => api.get('/Users'),
  getUserById: (id) => api.get(`/Users/${id}`),
  updateUser: (id, userData) => api.put(`/Users/${id}`, userData),
  getUserCourses: () => api.get('/Users/courses'),
  getTeacherCourses: (id) => api.get(`/Users/${id}/TeacherCourses`),
  getStudentCourses: (id) => api.get(`/Users/${id}/StudentCourses`),
  archiveCourse: (id) => api.put(`/Courses/${id}/Archive`),
  uploadProfileImage: (id, imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    return api.post(`/Users/${id}/ProfileImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getProfileImage: (id) => api.get(`/Users/${id}/ProfileImage`)
};

// Course services
export const courseService = {
  getAllCourses: () => api.get('/Courses'),
  getCourseById: (id) => api.get(`/Courses/${id}`),
  createCourse: (courseData) => api.post('/Courses', courseData),
  updateCourse: (id, courseData) => api.put(`/Courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/Courses/${id}`),
  archiveCourse: (id) => api.put(`/Courses/${id}/Archive`),
  enrollStudent: (courseId, studentData) => api.post(`/Courses/${courseId}/Enroll`, studentData),
  getCourseStudents: (courseId) => api.get(`/Courses/${courseId}/Students`),
  getCourseAssignments: (courseId) => api.get(`/Courses/${courseId}/Assignments`),
  getCourseAnnouncements: (courseId) => api.get(`/Courses/${courseId}/Announcements`),
  joinCourseByCode: (classCode, enrollmentData) => api.post(`/Courses/JoinByCode/${classCode}`, enrollmentData)
};

// Assignment services
export const assignmentService = {
  getAllAssignments: () => api.get('/Assignments'),
  getAssignmentById: (id) => api.get(`/Assignments/${id}`),
  createAssignment: (assignmentData) => api.post('/Assignments', assignmentData),
  updateAssignment: (id, assignmentData) => api.put(`/Assignments/${id}`, assignmentData),
  deleteAssignment: (id) => api.delete(`/Assignments/${id}`),
  getAssignmentSubmissions: (assignmentId) => api.get(`/Assignments/${assignmentId}/Submissions`),
  getStudentSubmission: (assignmentId, studentId) => 
    api.get(`/Assignments/${assignmentId}/Student/${studentId}/Submission`),
  submitAssignment: (assignmentId, studentId, submissionData) => 
    api.post(`/Assignments/${assignmentId}/Student/${studentId}/Submit`, submissionData),
  gradeSubmission: (submissionId, gradeData) => 
    api.post(`/Assignments/Submissions/${submissionId}/Grade`, gradeData)
};

// Announcement services
export const announcementService = {
  getAllAnnouncements: () => api.get('/Announcements'),
  getAnnouncementById: (id) => api.get(`/Announcements/${id}`),
  createAnnouncement: (announcementData) => api.post('/Announcements', announcementData),
  updateAnnouncement: (id, announcementData) => api.put(`/Announcements/${id}`, announcementData),
  deleteAnnouncement: (id) => api.delete(`/Announcements/${id}`),
  getCourseAnnouncements: (courseId) => api.get(`/Announcements/Course/${courseId}`)
};

// Notification services
export const notificationService = {
  getUserNotifications: () => api.get('/Notifications/User'),
  markAsRead: (id) => api.put(`/Notifications/${id}/MarkAsRead`),
  markAllAsRead: () => api.put('/Notifications/MarkAllAsRead')
};

export default api;
