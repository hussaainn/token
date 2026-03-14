import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Lazy load pages for better performance
// Auth
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
<<<<<<< HEAD
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f

// Customer
const BookService = lazy(() => import('./pages/customer/BookService'));
const LiveQueue = lazy(() => import('./pages/customer/LiveQueue'));
const MyTokens = lazy(() => import('./pages/customer/MyTokens'));
const LoyaltyDashboard = lazy(() => import('./pages/customer/LoyaltyDashboard'));
const Reviews = lazy(() => import('./pages/customer/Reviews'));
const Reschedule = lazy(() => import('./pages/customer/Reschedule'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StaffMgmt = lazy(() => import('./pages/admin/StaffMgmt'));
const ServicesMgmt = lazy(() => import('./pages/admin/ServicesMgmt'));
const QueueControl = lazy(() => import('./pages/admin/QueueControl'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const CheckIn = lazy(() => import('./pages/admin/CheckIn'));

// Staff
const AssignedTokens = lazy(() => import('./pages/staff/AssignedTokens'));

// Notifications
const Notifications = lazy(() => import('./pages/Notifications'));

// Loading component
const PageLoader = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
<<<<<<< HEAD
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
          <Route path="queue" element={<LiveQueue />} />
          <Route path="notifications" element={<Notifications />} />

          {/* Customer Routes */}
          <Route
            path="customer/*"
            element={
              <ProtectedRoute roles={['customer']}>
                <Routes>
                  <Route path="book" element={<BookService />} />
                  <Route path="tokens" element={<MyTokens />} />
                  <Route path="reschedule" element={<Reschedule />} />
                  <Route path="loyalty" element={<LoyaltyDashboard />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="staff" element={<StaffMgmt />} />
                  <Route path="services" element={<ServicesMgmt />} />
                  <Route path="queue" element={<QueueControl />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="check-in" element={<CheckIn />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="staff/*"
            element={
              <ProtectedRoute roles={['staff']}>
                <Routes>
                  <Route path="tokens" element={<AssignedTokens />} />
                  <Route path="check-in" element={<CheckIn />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
