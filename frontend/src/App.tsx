import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { DateProvider } from './store/DateContext';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Tasks } from './pages/Tasks';
import { Settings } from './pages/Settings';
import { Activities } from './pages/Activities';
import { Schedule } from './pages/Schedule';
import { Calendar } from './pages/Calendar';
// Categories removed
import { Templates } from './pages/Templates';
import Workouts from './pages/Workouts';
import Projects from './pages/Projects';
import ProjectKanban from './pages/ProjectKanban';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <DateProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="activities" element={<Activities />} />
              {/* Categories moved to settings */}
              <Route path="workouts" element={<Workouts />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectKanban />} />
              <Route path="analytics" element={<div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"><h1>Analytics (Coming Soon)</h1></div>} />
              <Route path="settings" element={<Settings />} />
              <Route path="templates" element={<Templates />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DateProvider>
    </AuthProvider>
  );
}
