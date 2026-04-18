import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { useAuthStore } from './store/authStore';
import AuthPage     from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PetsPage      from './pages/PetsPage';
import AddPetPage    from './pages/AddPetPage';
import TripSetupPage from './pages/TripSetupPage';
import ChecklistPage from './pages/ChecklistPage';
import SettingsPage  from './pages/SettingsPage';
import Layout        from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, mode } = useAuthStore();
  // Still loading session — show nothing to avoid flash
  if (mode === 'idle' || mode === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
        🐾
      </div>
    );
  }
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={
          <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
        } />
        <Route path="/pets" element={
          <PrivateRoute><Layout><PetsPage /></Layout></PrivateRoute>
        } />
        <Route path="/pets/add" element={
          <PrivateRoute><Layout><AddPetPage /></Layout></PrivateRoute>
        } />
        <Route path="/pets/edit/:petId" element={
          <PrivateRoute><Layout><AddPetPage /></Layout></PrivateRoute>
        } />
        <Route path="/trips/new" element={
          <PrivateRoute><Layout><TripSetupPage /></Layout></PrivateRoute>
        } />
        <Route path="/trips/:tripId" element={
          <PrivateRoute><Layout><ChecklistPage /></Layout></PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
