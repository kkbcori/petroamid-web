import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { Colors } from '../utils/theme';

const NAV = [
  { to: '/',          icon: '🏠', label: 'Home'     },
  { to: '/pets',      icon: '🐾', label: 'My Pets'  },
  { to: '/trips/new', icon: '✈️', label: 'New Trip' },
  { to: '/stays',     icon: '🏨', label: 'Stays'    },
  { to: '/vets',      icon: '🏥', label: 'Vets'     },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeProfile, logout, profiles, switchProfile } = useProfileStore();
  const navigate = useNavigate();
  const profile  = activeProfile();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: Colors.navy }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: Colors.navyMid, borderBottom: `1px solid ${Colors.border}`,
        padding: '0 20px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: `0 2px 10px ${Colors.shadow}`,
      }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img src="/petroamid-web/logo.jpg" alt="PetRoamID" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: '#2A9D8F', whiteSpace: 'nowrap' }}>
            PetRoamID
          </span>
        </NavLink>

        {/* Desktop nav — horizontal scrollable */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: 2, alignItems: 'center', overflowX: 'auto' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 20,
              fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all .15s', whiteSpace: 'nowrap',
              color: isActive ? '#2A9D8F' : Colors.creammid,
              background: isActive ? 'rgba(42,157,143,0.12)' : 'transparent',
            })}>
              <span>{n.icon}</span><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ position: 'relative', marginLeft: 8 }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            width: 38, height: 38, borderRadius: '50%', fontSize: 20,
            background: 'rgba(42,157,143,0.15)', border: '2px solid #2A9D8F',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {profile?.avatarEmoji ?? '👤'}
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 46,
              background: Colors.navyMid, border: `1px solid ${Colors.border}`,
              borderRadius: 14, padding: 8, minWidth: 210,
              boxShadow: `0 8px 28px ${Colors.shadow}`, zIndex: 200,
            }}>
              <div style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${Colors.borderLight}`, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: Colors.cream }}>
                  {profile?.avatarEmoji} {profile?.displayName}
                </div>
                <div style={{ fontSize: 11, color: Colors.creammid, marginTop: 2 }}>📱 Stored on this device</div>
              </div>
              {profiles.filter(p => p.id !== profile?.id).map(p => (
                <MenuBtn key={p.id} onClick={() => { switchProfile(p.id); setMenuOpen(false); }}>
                  {p.avatarEmoji} Switch to {p.displayName}
                </MenuBtn>
              ))}
              {profiles.filter(p => p.id !== profile?.id).length > 0 && (
                <div style={{ borderTop: `1px solid ${Colors.borderLight}`, margin: '4px 0' }} />
              )}
              <MenuBtn onClick={() => { navigate('/settings'); setMenuOpen(false); }}>⚙️  Settings &amp; Export</MenuBtn>
              <MenuBtn onClick={() => { logout(); navigate('/profile'); setMenuOpen(false); }} danger>
                🔀  Switch Profile
              </MenuBtn>
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '24px 16px 110px' }}>
        {children}
      </main>

      {/* Mobile bottom nav — 6 items, smaller text */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: Colors.navyMid, borderTop: `1px solid ${Colors.border}`,
        display: 'flex', justifyContent: 'space-around', padding: '6px 0 12px', zIndex: 100,
      }}>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            textDecoration: 'none', padding: '4px 6px', borderRadius: 10, minWidth: 0,
            color: isActive ? '#2A9D8F' : Colors.creammid,
          })}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 500, whiteSpace: 'nowrap' }}>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) { .mobile-nav { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
      `}</style>
    </div>
  );
}

function MenuBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 8,
      fontSize: 14, color: danger ? Colors.red : Colors.cream,
      background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
    }}
    onMouseEnter={e => (e.currentTarget.style.background = Colors.navyLight)}
    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
      {children}
    </button>
  );
}
