import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'react-hot-toast';

import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddCollection } from './pages/AddCollection';
import { Collections } from './pages/Collections';
import { Donors } from './pages/Donors';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { DailyReport } from './pages/DailyReport';
import { DataManagement } from './pages/DataManagement';
import { Collectors } from './pages/Collectors';
import { Users } from './pages/Users';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-devanagari text-amber-300 font-bold">लोड होत आहे... || गणपती बाप्पा मोरया ||</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#161622',
              color: '#fff',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '14px',
              fontSize: '13px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            }
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="collections/new" element={<AddCollection />} />
            <Route path="collections" element={<Collections />} />
            <Route path="donors" element={<Donors />} />

            {/* Admin Restricted Only */}
            <Route
              path="expenses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="daily-report"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TREASURER']}>
                  <DailyReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="data-management"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TREASURER']}>
                  <DataManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="collectors"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TREASURER']}>
                  <Collectors />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Restricted */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </AuthProvider>
);
}

export default App;
