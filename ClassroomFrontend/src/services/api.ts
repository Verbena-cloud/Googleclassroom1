import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
// Import mock authentication services for development
import { mockLogin, mockRegister, mockGetCurrentUser } from './mockAuthService';
import { 
  LoginCredentials, 
  RegisterData, 
  Assignment, 
  Announcement, 
  AssignmentSubmission,
  EnrollmentData,
  GradeData,
  Notification,
  ApiResponse
} from '../types/api';
import { User } from '../types/index';
import { Course } from '../types/course';

// API URL for the backend connected to SQL Server
const API_URL = 'http://localhost:5114/api';
console.log('API URL:', API_URL);

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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
  register: async (userData: RegisterData): Promise<AxiosResponse<ApiResponse<User>>> => {
    console.log('Registering user with data:', userData);
    if (USE_MOCK_SERVICES) {
      return await mockRegister(userData);
    }
    return await api.post('/Auth/register', userData);
  },
  login: async (credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse<User>>> => {
    console.log('Logging in with credentials:', credentials);
    if (USE_MOCK_SERVICES) {
      return await mockLogin(credentials);
    }
    return await api.post('/Auth/login', credentials);
  },
  getCurrentUser: async (): Promise<AxiosResponse<ApiResponse<User>>> => {
    if (USE_MOCK_SERVICES) {
      return await mockGetCurrentUser();
    }
    return await api.get('/Users/current');
  }
};

// User services
export const userService = {
  getAllUsers: (): Promise<AxiosResponse<ApiResponse<User[]>>> => 
    api.get('/Users'),
  getUserById: (id: string): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.get(`/Users/${id}`),
  updateUser: (id: string, userData: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.put(`/Users/${id}`, userData),
  getUserCourses: (): Promise<AxiosResponse<ApiResponse<Course[]>>> => 
    api.get('/Users/courses'),
  getTeacherCourses: (id?: string): Promise<AxiosResponse<ApiResponse<Course[]>>> => 
    api.get(`/Users/${id}/TeacherCourses`),
  getStudentCourses: (id?: string): Promise<AxiosResponse<ApiResponse<Course[]>>> => 
    api.get(`/Users/${id}/StudentCourses`),
  uploadProfileImage: (id: string, imageFile: File): Promise<AxiosResponse<ApiResponse<string>>> => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    return api.post(`/Users/${id}/ProfileImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getProfileImage: (id: string): Promise<AxiosResponse<ApiResponse<string>>> => 
    api.get(`/Users/${id}/ProfileImage`)
};

// Course services
export const courseService = {
  getAllCourses: (): Promise<AxiosResponse<ApiResponse<Course[]>>> => 
    api.get('/Courses'),
  getCourseById: (id: string): Promise<AxiosResponse<ApiResponse<Course>>> => 
    api.get(`/Courses/${id}`),
  createCourse: (courseData: Partial<Course>): Promise<AxiosResponse<ApiResponse<Course>>> => 
    api.post('/Courses', courseData),
  updateCourse: (id: string, courseData: Partial<Course>): Promise<AxiosResponse<ApiResponse<Course>>> => 
    api.put(`/Courses/${id}`, courseData),
  deleteCourse: (id: string): Promise<AxiosResponse<ApiResponse<boolean>>> => 
    api.delete(`/Courses/${id}`),
  enrollStudent: (courseId: string, studentData: EnrollmentData): Promise<AxiosResponse<ApiResponse<boolean>>> => 
    api.post(`/Courses/${courseId}/Enroll`, studentData),
  getCourseStudents: (courseId: string): Promise<AxiosResponse<ApiResponse<User[]>>> => 
    api.get(`/Courses/${courseId}/Students`),
  getCourseAssignments: (courseId: string): Promise<AxiosResponse<ApiResponse<Assignment[]>>> => 
    api.get(`/Courses/${courseId}/Assignments`),
  getCourseAnnouncements: (courseId: string): Promise<AxiosResponse<ApiResponse<Announcement[]>>> => 
    api.get(`/Courses/${courseId}/Announcements`),
  joinCourseByCode: (classCode: string, enrollmentData: EnrollmentData): Promise<AxiosResponse<ApiResponse<boolean>>> => 
    api.post(`/Courses/JoinByCode/${classCode}`, enrollmentData)
};

// Assignment services
export const assignmentService = {
  getAllAssignments: (): Promise<AxiosResponse<ApiResponse<Assignment[]>>> => 
    api.get('/Assignments'),
  getAssignmentById: (id: string): Promise<AxiosResponse<ApiResponse<Assignment>>> => 
    api.get(`/Assignments/${id}`),
  createAssignment: (assignmentData: Partial<Assignment>): Promise<AxiosResponse<ApiResponse<Assignment>>> => 
    api.post('/Assignments', assignmentData),
  updateAssignment: (id: string, assignmentData: Partial<Assignment>): Promise<AxiosResponse<ApiResponse<Assignment>>> => 
    api.put(`/Assignments/${id}`, assignmentData),
  deleteAssignment: (id: string): Promise<AxiosResponse<ApiResponse<boolean>>> => 
    api.delete(`/Assignments/${id}`),
  getAssignmentSubmissions: (assignmentId: string): Promise<AxiosResponse<ApiResponse<AssignmentSubmission[]>>> => 
    api.get(`/Assignments/${assignmentId}/Submissions`),
  getStudentSubmission: (assignmentId: string, studentId: string): Promise<AxiosResponse<ApiResponse<AssignmentSubmission>>> => 
    api.get(`/Assignments/${assignmentId}/Student/${studentId}/Submission`),
  submitAssignment: (assignmentId: string, studentId: string, submissionData: Partial<AssignmentSubmission>): Promise<AxiosResponse<ApiResponse<AssignmentSubmission>>> => 
    api.post(`/Assignments/${assignmentId}/Student/${studentId}/Submit`, submissionData),
  gradeSubmission: (submissionId: string, gradeData: GradeData): Promise<AxiosResponse<ApiResponse<AssignmentSubmission>>> => 
    api.post(`/Assignments/Submissions/${submissionId}/Grade`, gradeData)
};

// Announcement services
export const announcementService = {
  getAllAnnouncements: (): Promise<AxiosResponse<ApiResponse<Announcement[]>>> => 
    api.get('/Announcements'),
  getAnnouncementById: (id: string): Promise<AxiosResponse<ApiResponse<Announcement>>> => 
    api.get(`/Announcements/${id}`),
  createAnnouncement: (announcementData: Partial<Announcement>): Promise<AxiosResponse<ApiResponse<Announcement>>> => 
    api.post('/Announcements', announcementData),
  updateAnnouncement: (id: string, announcementData: Partial<Announcement>): Promise<AxiosResponse<ApiResponse<Announcement>>> => 
    api.put(`/Announcements/${id}`, announcementData),
  deleteAnnouncement: (id: string): Promise<AxiosResponse<ApiResponse<boolean>>> => 
    api.delete(`/Announcements/${id}`),
  getCourseAnnouncements: (courseId: string): Promise<AxiosResponse<ApiResponse<Announcement[]>>> => 
    api.get(`/Announcements/Course/${courseId}`)
};

// Notification services
export const notificationService = {
  getUserNotifications: (): Promise<AxiosResponse<ApiResponse<Notification[]>>> => 
    api.get('/Notifications/User'),
  markAsRead: (id: string): Promise<AxiosResponse<ApiResponse<boolean>>> => 
    api.put(`/Notifications/${id}/MarkAsRead`),
  markAllAsRead: (): Promise<AxiosResponse<ApiResponse<boolean>>> => 
    api.put('/Notifications/MarkAllAsRead')
};

export default api;
