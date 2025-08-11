import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './components/auth/AuthWrapper';
import LoginForm from './components/auth/LoginForm';
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import { ROLES } from './utils/constants';

const App = () => {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === ROLES.TEACHER ? '/teacher' : '/student'} />
            ) : (
              <LoginForm />
            )
          }
        />
        <Route
          path="/student"
          element={
            <StudentDashboard user={user} onLogout={logout} />
          }
        />
        <Route
          path="/teacher"
          element={
            <TeacherDashboard user={user} onLogout={logout} />
          }
        />
        <Route
          path="*"
          element={<Navigate to={user ? (user.role === ROLES.TEACHER ? '/teacher' : '/student') : '/login'} />}
        />
      </Routes>
    </>
  );
};

export default App;
