import { User } from './index';
import { Course } from './course';

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Assignment related types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submissionDate: string;
  grade?: number;
  feedback?: string;
  attachments?: string[];
}

// Announcement related types
export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Notification related types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  relatedItemId?: string;
}

// Form data types
export interface EnrollmentData {
  studentId: string;
  courseId: string;
}

export interface GradeData {
  grade: number;
  feedback?: string;
}
