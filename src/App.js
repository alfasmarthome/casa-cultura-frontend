import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PublicCalendarPage from './pages/PublicCalendarPage';
import UsersPage from './pages/UsersPage';
import SpacesPage from './pages/SpacesPage';
import AuditPage from './pages/AuditPage';
import BlockedDatesPage from './pages/BlockedDatesPage';
import ReportsPage from './pages/ReportsPage';
import Layout from './components/Layout/Layout';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className='loading-full'><div className='spinner' /></div>;
  if (!user) return <Navigate to='/login' replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to='/dashboard' replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position='top-right' toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path='/' element={<Navigate to='/calendario-publico' replace />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/calendario-publico' element={<PublicCalendarPage />} />
          <Route path='/dashboard' element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
          <Route path='/usuarios' element={<PrivateRoute adminOnly><Layout><UsersPage /></Layout></PrivateRoute>} />
          <Route path='/espacios' element={<PrivateRoute adminOnly><Layout><SpacesPage /></Layout></PrivateRoute>} />
          <Route path='/historial' element={<PrivateRoute><Layout><AuditPage /></Layout></PrivateRoute>} />
          <Route path='/fechas-bloqueadas' element={<PrivateRoute adminOnly><Layout><BlockedDatesPage /></Layout></PrivateRoute>} />
          <Route path='/reportes' element={<PrivateRoute><Layout><ReportsPage /></Layout></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
