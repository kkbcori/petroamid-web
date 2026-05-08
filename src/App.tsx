import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider }   from './store/AppContext';
import { useProfileStore } from './store/profileStore';
import ProfilePage   from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import PetsPage      from './pages/PetsPage';
import AddPetPage    from './pages/AddPetPage';
import TripSetupPage from './pages/TripSetupPage';
import ChecklistPage from './pages/ChecklistPage';
import SettingsPage  from './pages/SettingsPage';
import StaysPage     from './pages/StaysPage';
import VetsPage      from './pages/VetsPage';
import CarePage      from './pages/CarePage';
import CareSetupPage from './pages/CareSetupPage';
import Layout        from './components/Layout';

function Guard({ children }: { children: React.ReactNode }) {
  const activeProfileId = useProfileStore(s => s.activeProfileId);
  if (!activeProfileId) return <Navigate to="/profile" replace />;
  return <>{children}</>;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Guard><Layout>{children}</Layout></Guard>;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/profile"          element={<ProfilePage />} />
        <Route path="/"                 element={<Wrap><DashboardPage /></Wrap>} />
        <Route path="/pets"             element={<Wrap><PetsPage /></Wrap>} />
        <Route path="/pets/add"         element={<Wrap><AddPetPage /></Wrap>} />
        <Route path="/pets/edit/:petId" element={<Wrap><AddPetPage /></Wrap>} />
        <Route path="/care"             element={<Wrap><CarePage /></Wrap>} />
        <Route path="/care/setup/:petId" element={<Wrap><CareSetupPage /></Wrap>} />
        <Route path="/trips/new"        element={<Wrap><TripSetupPage /></Wrap>} />
        <Route path="/trips/:tripId"    element={<Wrap><ChecklistPage /></Wrap>} />
        <Route path="/stays"            element={<Wrap><StaysPage /></Wrap>} />
        <Route path="/vets"             element={<Wrap><VetsPage /></Wrap>} />
        <Route path="/settings"         element={<Wrap><SettingsPage /></Wrap>} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
