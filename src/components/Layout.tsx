import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { Colors } from '../utils/theme';
import lottie, { AnimationItem } from 'lottie-web';

// Lottie JSON imports
import lottieHomeData     from '../assets/lottie-home.json';
import lottiePetsData     from '../assets/lottie-mypets.json';
import lottieTripData     from '../assets/lottie-newtrip.json';
import lottieStaysData    from '../assets/lottie-stays.json';
import lottieVetsData     from '../assets/lottie-vets.json';
import lottieSettingsData from '../assets/lottie-settings.json';

// ── Lottie tab icon component ─────────────────────────────────────────────────
// Web:  lottie-web renders SVG inline
// RN:   <LottieView source={require('../assets/lottie-home.json')}
//           autoPlay={focused} loop={false} style={{width:28,height:28}} />
interface LottieTabIconProps {
  data: object;
  isActive: boolean;
  size?: number;
  loop?: boolean;
}

function LottieTabIcon({ data, isActive, size = 28, loop = false }: LottieTabIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animRef.current = lottie.loadAnimation({
      container:     containerRef.current,
      renderer:      'svg',
      loop,
      autoplay:      false,
      animationData: data,
    });
    return () => { animRef.current?.destroy(); animRef.current = null; };
  }, []);

  useEffect(() => {
    if (!animRef.current) return;
    if (isActive) {
      animRef.current.goToAndPlay(0);
    } else {
      animRef.current.goToAndStop(0, true);
    }
  }, [isActive]);

  return <div ref={containerRef} style={{ width: size, height: size, flexShrink: 0 }} />;
}

// ── Nav definition ─────────────────────────────────────────────────────────────
const NAV = [
  { to: '/',          label: 'Home',     data: lottieHomeData,     loop: false },
  { to: '/pets',      label: 'My Pets',  data: lottiePetsData,     loop: false },
  { to: '/trips/new', label: 'New Trip', data: lottieTripData,     loop: false },
  { to: '/stays',     label: 'Stays',    data: lottieStaysData,    loop: false },
  { to: '/vets',      label: 'Vets',     data: lottieVetsData,     loop: false },
  { to: '/settings',  label: 'Settings', data: lottieSettingsData, loop: true  },
];

// ── Layout ────────────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeProfile, logout, profiles, switchProfile } = useProfileStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const profile   = activeProfile();

  function isTabActive(to: string) {
    if (to === '/') return location.pathname === '/' || location.pathname === '/petroamid-web' || location.pathname === '/petroamid-web/';
    return location.pathname.startsWith(to);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: Colors.navy }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: Colors.navyMid, borderBottom: `1px solid ${Colors.border}`,
        padding: '0 20px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: `0 2px 10px ${Colors.shadow}`,
      }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img src="/petroamid-web/logo.jpg" alt="PetRoamID"
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', background: '#2A9D8F' }} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: '#2A9D8F', whiteSpace: 'nowrap' }}>
            PetRoamID
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV.map(n => {
            const active = isTabActive(n.to);
            return (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                borderRadius: 20, textDecoration: 'none', transition: 'all .15s', whiteSpace: 'nowrap',
                fontSize: 13, fontWeight: 500,
                color:      isActive ? '#2A9D8F' : Colors.creammid,
                background: isActive ? 'rgba(42,157,143,0.12)' : 'transparent',
              })}>
                <LottieTabIcon data={n.data} isActive={active} size={22} loop={n.loop} />
                <span>{n.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profile avatar */}
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
              <MenuBtn onClick={() => { navigate('/settings'); setMenuOpen(false); }}>⚙️ Settings &amp; Export</MenuBtn>
              <MenuBtn onClick={() => { logout(); navigate('/profile'); setMenuOpen(false); }} danger>
                🔀 Switch Profile
              </MenuBtn>
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '24px 16px 110px' }}>
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: Colors.navyMid, borderTop: `1px solid ${Colors.border}`,
        display: 'flex', justifyContent: 'space-around',
        padding: '6px 0 env(safe-area-inset-bottom, 12px)', zIndex: 100,
      }}>
        {NAV.map(n => {
          const active = isTabActive(n.to);
          return (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              textDecoration: 'none', padding: '4px 6px', borderRadius: 10, minWidth: 0,
              color: isActive ? '#2A9D8F' : Colors.creammid,
            })}>
              <LottieTabIcon data={n.data} isActive={active} size={28} loop={n.loop} />
              <span style={{ fontSize: 9, fontWeight: 500, whiteSpace: 'nowrap' }}>{n.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) { .mobile-nav  { display: none !important; } }
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

// ── Export for reuse on other pages (confetti, loader etc.) ───────────────────
export { LottieTabIcon };
