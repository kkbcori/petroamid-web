import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { useProfileStore } from './store/profileStore';
import ProfilePage   from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import PetsPage      from './pages/PetsPage';
import AddPetPage    from './pages/AddPetPage';
import TripSetupPage from './pages/TripSetupPage';
import ChecklistPage from './pages/ChecklistPage';
import SettingsPage  from './pages/SettingsPage';
import Layout        from './components/Layout';

function Guard({ children }: { children: React.ReactNode }) {
  const activeProfileId = useProfileStore(s => s.activeProfileId);
  if (!activeProfileId) return <Navigate to="/profile" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Guard><Layout><DashboardPage /></Layout></Guard>} />
        <Route path="/pets" element={<Guard><Layout><PetsPage /></Layout></Guard>} />
        <Route path="/pets/add" element={<Guard><Layout><AddPetPage /></Layout></Guard>} />
        <Route path="/pets/edit/:petId" element={<Guard><Layout><AddPetPage /></Layout></Guard>} />
        <Route path="/trips/new" element={<Guard><Layout><TripSetupPage /></Layout></Guard>} />
        <Route path="/trips/:tripId" element={<Guard><Layout><ChecklistPage /></Layout></Guard>} />
        <Route path="/settings" element={<Guard><Layout><SettingsPage /></Layout></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
