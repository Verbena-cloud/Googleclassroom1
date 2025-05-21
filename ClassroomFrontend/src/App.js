import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// User Context
import { UserProvider } from './context/UserContext';

// Components
import AppLayout from './components/layout/AppLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import GoogleClassroomDashboard from './pages/GoogleClassroomDashboard';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import JoinClass from './pages/JoinClass';
import JoinCourse from './pages/JoinCourse';
import ClassView from './pages/ClassView';

// Auth utils
import { isAuthenticated } from './utils/auth';

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <GoogleClassroomDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="calendar" 
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="courses/create" 
              element={
                <ProtectedRoute>
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="join-class" 
              element={
                <ProtectedRoute>
                  <JoinClass />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="join-course" 
              element={
                <ProtectedRoute>
                  <JoinCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="class/:courseId" 
              element={
                <ProtectedRoute>
                  <ClassView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="create-course" 
              element={
                <ProtectedRoute>
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="edit-course/:id" 
              element={
                <ProtectedRoute>
                  <EditCourse />
                </ProtectedRoute>
              } 
            />
            {/* Add more routes here as you develop more pages */}
          </Route>
        </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
