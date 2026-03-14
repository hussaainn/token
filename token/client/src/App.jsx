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
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Customer
const BookService = lazy(() => import('./pages/customer/BookService'));
const LiveQueue = lazy(() => import('./pages/customer/LiveQueue'));
const MyTokens = lazy(() => import('./pages/customer/MyTokens'));
const LoyaltyDashboard = lazy(() => import('./pages/customer/LoyaltyDashboard'));
const Reviews = lazy(() => import('./pages/customer/Reviews'));
const Reschedule = lazy(() => import('./pages/customer/Reschedule'));

// Admin
const AdminMobileHeader = lazy(() => import('./components/AdminMobileHeader'));
const AdminSidebar = lazy(() => import('./components/AdminSidebar'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StaffMgmt = lazy(() => import('./pages/admin/StaffMgmt'));
const ServicesMgmt = lazy(() => import('./pages/admin/ServicesMgmt'));
const QueueControl = lazy(() => import('./pages/admin/QueueControl'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const CheckIn = lazy(() => import('./pages/admin/CheckIn'));
const CustomerHistory = lazy(() => import('./pages/admin/CustomerHistory'));
const TodayServices = lazy(() => import('./pages/admin/TodayServices'));
const Feedback = lazy(() => import('./pages/admin/Feedback'));

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
  const AdminLayout = ({ children }) => (
    <div style={{ display: 'flex' }}>
      <Suspense fallback={null}><AdminSidebar /></Suspense>
      <main style={{ marginLeft: '220px', flex: 1, padding: '2rem', minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="admin-mobile-header-wrapper">
          <Suspense fallback={null}><AdminMobileHeader /></Suspense>
        </div>
        {children}
      </main>
    </div>
  );

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
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
                  <Route path="dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                  <Route path="staff" element={<AdminLayout><StaffMgmt /></AdminLayout>} />
                  <Route path="services" element={<AdminLayout><ServicesMgmt /></AdminLayout>} />
                  <Route path="queue" element={<AdminLayout><QueueControl /></AdminLayout>} />
                  <Route path="analytics" element={<AdminLayout><Analytics /></AdminLayout>} />
                  <Route path="check-in" element={<AdminLayout><CheckIn /></AdminLayout>} />
                  <Route path="history" element={<AdminLayout><CustomerHistory /></AdminLayout>} />
                  <Route path="today" element={<AdminLayout><TodayServices /></AdminLayout>} />
                  <Route path="feedback" element={<AdminLayout><Feedback /></AdminLayout>} />
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
                  <Route path="dashboard" element={<Navigate to="/staff/tokens" replace />} />
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
