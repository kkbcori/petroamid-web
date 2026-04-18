import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../utils/theme';

const NAV = [
  { to: '/',          icon: '🏠', label: 'Home'     },
  { to: '/pets',      icon: '🐾', label: 'My Pets'  },
  { to: '/trips/new', icon: '✈️', label: 'New Trip' },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
];

const SYNC_LABEL: Record<string, { icon: string; color: string; text: string }> = {
  idle:    { icon: '☁️',  color: Colors.creammid, text: 'Cloud sync'  },
  syncing: { icon: '🔄',  color: Colors.gold,     text: 'Syncing…'    },
  synced:  { icon: '✅',  color: Colors.green,    text: 'Synced'      },
  error:   { icon: '⚠️',  color: Colors.red,      text: 'Sync error'  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { displayName, avatarUrl, signOut, syncStatus } = useAuthStore();
  const navigate = useNavigate();
  const sync = SYNC_LABEL[syncStatus] ?? SYNC_LABEL.idle;
  const initials = displayName().slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: Colors.navy }}>
      {/* ── Top bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: Colors.navyMid,
        borderBottom: `1px solid ${Colors.border}`,
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 62,
        boxShadow: `0 2px 10px ${Colors.shadow}`,
      }}>
        {/* Brand */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="./logo.jpg" alt="PetRoamID" style={{
            width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0,
          }} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: '#2A9D8F' }}>
            PetRoamID
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              fontSize: 14, fontWeight: 500,
              color: isActive ? '#2A9D8F' : Colors.creammid,
              background: isActive ? 'rgba(42,157,143,0.12)' : 'transparent',
              textDecoration: 'none', transition: 'all .15s',
            })}>
              <span>{n.icon}</span><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sync + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Sync pill */}
          <div title={syncStatus} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 20,
            background: Colors.navyLight, border: `1px solid ${Colors.border}`,
            fontSize: 12, color: sync.color,
          }} className="sync-pill">
            <span style={{ display: 'inline-block', animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none' }}>
              {sync.icon}
            </span>
            <span className="sync-text">{sync.text}</span>
          </div>

          {/* Avatar button */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: avatarUrl() ? 'transparent' : 'rgba(42,157,143,0.15)',
              border: '2px solid #2A9D8F',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#2A9D8F', overflow: 'hidden',
            }}>
              {avatarUrl()
                ? <img src={avatarUrl()!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 46,
                background: Colors.navyMid, border: `1px solid ${Colors.border}`,
                borderRadius: 14, padding: 8, minWidth: 200,
                boxShadow: `0 8px 28px ${Colors.shadow}`, zIndex: 200,
              }}>
                <div style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${Colors.borderLight}`, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: Colors.cream }}>{displayName()}</div>
                  <div style={{ fontSize: 11, color: sync.color, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {sync.icon} {sync.text}
                  </div>
                </div>
                <MenuBtn onClick={() => { navigate('/settings'); setMenuOpen(false); }}>⚙️  Settings &amp; Sync</MenuBtn>
                <MenuBtn onClick={() => { signOut().then(() => navigate('/login')); setMenuOpen(false); }} danger>
                  🚪  Sign Out
                </MenuBtn>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '24px 16px 100px' }}>
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: Colors.navyMid, borderTop: `1px solid ${Colors.border}`,
        display: 'flex', justifyContent: 'space-around', padding: '8px 0 14px',
        zIndex: 100,
      }} className="mobile-nav">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            textDecoration: 'none', padding: '4px 12px', borderRadius: 12,
            color: isActive ? '#2A9D8F' : Colors.creammid,
          })}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 768px) { .mobile-nav { display: none !important; } }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .sync-text   { display: none; }
          .sync-pill   { padding: 4px 6px !important; }
        }
      `}</style>
    </div>
  );
}

function MenuBtn({ children, onClick, danger }: {
  children: React.ReactNode; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', padding: '9px 12px',
      borderRadius: 8, fontSize: 14,
      color: danger ? Colors.red : Colors.cream,
      background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
    }}
    onMouseEnter={e => (e.currentTarget.style.background = Colors.navyLight)}
    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
      {children}
    </button>
  );
}
