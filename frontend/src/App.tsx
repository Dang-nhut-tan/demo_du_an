import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileContainer } from './components/layout/MobileContainer';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { CreateBookingPage } from './features/booking/CreateBookingPage';
import { ScheduleChangePage } from './features/schedule-change/ScheduleChangePage';
import { TrackingProgressPage } from './features/tracking/TrackingProgressPage';
import { DispatcherPage } from './features/dispatcher/DispatcherPage';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { MasterDataPage } from './features/admin/MasterDataPage';
import { CustomerManagementPage } from './features/admin/CustomerManagementPage';
import { FormConfigPage } from './features/admin/FormConfigPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { RegistrationsPage } from './features/admin/RegistrationsPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary fallbackTitle="Không thể tải ứng dụng">
        <Routes>
        {/* Full-width Screen 1: Login & Registration */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Core Mobile / Responsive Screens wrapped in MobileContainer */}
        <Route
          path="/"
          element={
            <MobileContainer>
              <DashboardPage />
            </MobileContainer>
          }
        />
        <Route
          path="/profile"
          element={
            <MobileContainer>
              <ProfilePage />
            </MobileContainer>
          }
        />
        <Route
          path="/notifications"
          element={
            <MobileContainer>
              <NotificationsPage />
            </MobileContainer>
          }
        />

        {/* Booking & Tracking Workflows (Screens 3, 4, 5) */}
        <Route
          path="/booking/new"
          element={
            <MobileContainer>
              <CreateBookingPage />
            </MobileContainer>
          }
        />
        <Route
          path="/create-booking"
          element={
            <MobileContainer>
              <CreateBookingPage />
            </MobileContainer>
          }
        />
        <Route
          path="/booking/create"
          element={
            <MobileContainer>
              <CreateBookingPage />
            </MobileContainer>
          }
        />
        <Route
          path="/schedule-change"
          element={
            <MobileContainer>
              <ScheduleChangePage />
            </MobileContainer>
          }
        />
        <Route
          path="/tracking"
          element={
            <MobileContainer>
              <TrackingProgressPage />
            </MobileContainer>
          }
        />

        {/* Screen 7: Dispatcher Dashboard */}
        <Route
          path="/dispatcher"
          element={
            <MobileContainer>
              <DispatcherPage />
            </MobileContainer>
          }
        />

        {/* Enterprise Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
          <Route path="customers" element={<CustomerManagementPage />} />
          <Route path="form-config" element={<FormConfigPage />} />
        </Route>

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  </BrowserRouter>
  );
};

export default App;
