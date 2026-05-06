import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { Colors } from '../utils/theme';
import logoUrl      from '../assets/logo.jpg';
import sceneWalkUrl from '../assets/scene-walk.png';

const BG     = '#E8F4F2';
const AVATARS = ['🐶','🐱','🦮','🐕','🐈','🐩','🦜','🐇','🐾','🌍'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profiles, createProfile, switchProfile, activeProfileId, updateProfile, deleteProfile } = useProfileStore();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string|null>(null);
  const [creating,    setCreating]    = useState(profiles.length === 0);
  const [name,        setName]        = useState('');
  const [chosenEmoji, setChosenEmoji] = useState(AVATARS[0]);
  const [error,       setError]       = useState('');

  React.useEffect(() => {
    if (activeProfileId) navigate('/', { replace: true });
  }, [activeProfileId]); // eslint-disable-line

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    const p = createProfile(name.trim());
    updateProfile(p.id, { avatarEmoji: chosenEmoji });
    navigate('/');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Walk scene image ──────────────────────────────────────────────────
          backgroundColor on the <img> = transparent PNG pixels show BG colour.
          Same fix as PageBanner. Maps to RN: <Image style={{ backgroundColor }} />
      ── */}
      <img
        src={sceneWalkUrl}
        alt=""
        aria-hidden="true"
        style={{
          position:        'fixed',
          bottom:           0,
          right:           -16,
          height:          '50vh',
          maxWidth:        '65vw',
          objectFit:       'contain',
          objectPosition:  'bottom right',
          opacity:          0.90,
          userSelect:      'none',
          pointerEvents:   'none',
          zIndex:           0,
        }}
      />

      {/* Gradient — text side */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to right, ${BG} 36%, ${BG}dd 55%, ${BG}55 72%, transparent 90%)`,
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '25vh', zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to bottom, transparent, ${BG})`,
      }} />

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 2, padding: '44px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/petroamid-web/logo.jpg" alt="PetRoamID" style={{ width: 44, height: 44, borderRadius: 11, objectFit: 'contain', background: '#2A9D8F', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#1a3530' }}>PetRoamID</div>
            <div style={{ fontSize: 11, color: '#4a7a70' }}>International pet travel compliance</div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, padding: '28px 20px 0' }}>
        <div style={{
          background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', borderRadius: 22, padding: 26,
          width: '100%', maxWidth: 400,
          boxShadow: '0 8px 40px rgba(42,130,110,0.12)',
          border: '1px solid rgba(255,255,255,0.8)',
        }}>

          {!creating && profiles.length > 0 && (<>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#1a3530', marginBottom: 4 }}>Who's travelling? 🌍</h2>
            <p style={{ fontSize: 13, color: '#5a8070', marginBottom: 16 }}>Select your profile to continue</p>
            {profiles.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {confirmDeleteId === p.id ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)' }}>
                    <span style={{ flex: 1, fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Delete "{p.displayName}"?</span>
                    <button onClick={() => { try { localStorage.removeItem(`petroamid-${p.id}`); } catch {} deleteProfile(p.id); setConfirmDeleteId(null); }} style={{ padding: '5px 12px', borderRadius: 8, background: '#ef4444', border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Delete</button>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(42,130,110,0.1)', border: 'none', color: '#5a8070', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (<>
                  <button onClick={() => switchProfile(p.id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14,
                    backgroundColor: `${BG}cc`, border: '1.5px solid rgba(42,130,110,0.15)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A9D8F'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(42,130,110,0.15)'; e.currentTarget.style.transform = 'none'; }}>
                    <span style={{ fontSize: 30 }}>{p.avatarEmoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3530' }}>{p.displayName}</div>
                      <div style={{ fontSize: 11, color: '#5a8070' }}>Joined {new Date(p.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</div>
                    </div>
                    <span style={{ color: '#2A9D8F', fontSize: 18, fontWeight: 700 }}>›</span>
                  </button>
                  <button onClick={() => setConfirmDeleteId(p.id)} title="Delete profile" style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>🗑️</button>
                </>)}
              </div>
            ))}

          </>)}

          {creating && (
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                {profiles.length > 0 && (
                  <button type="button" onClick={() => { setCreating(false); setError(''); }} style={{ backgroundColor: `${BG}cc`, border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#5a8070', fontSize: 13 }}>← Back</button>
                )}
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 700, color: '#1a3530' }}>{profiles.length === 0 ? "Let's get started 🐾" : 'New Profile'}</h2>
                  <p style={{ fontSize: 11, color: '#5a8070' }}>No account needed · stays on your device</p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5a8070', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pick your avatar</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {AVATARS.map(e => (
                    <button key={e} type="button" onClick={() => setChosenEmoji(e)} style={{
                      fontSize: 24, height: 46, borderRadius: 11,
                      border: `2px solid ${chosenEmoji === e ? '#2A9D8F' : 'rgba(42,130,110,0.15)'}`,
                      backgroundColor: chosenEmoji === e ? 'rgba(42,157,143,0.12)' : `${BG}cc`,
                      cursor: 'pointer', transform: chosenEmoji === e ? 'scale(1.1)' : 'scale(1)', transition: 'all .12s',
                    }}>{e}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5a8070', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Name *</label>
                <input value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="e.g. Alex" autoFocus style={{
                  width: '100%', padding: '12px 14px', borderRadius: 11,
                  border: `1.5px solid ${error ? Colors.red : 'rgba(42,130,110,0.2)'}`,
                  backgroundColor: `${BG}cc`, fontSize: 15, color: '#1a3530',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e  => (e.target.style.borderColor = error ? Colors.red : 'rgba(42,130,110,0.2)')} />
                {error && <div style={{ fontSize: 12, color: Colors.red, marginTop: 4 }}>{error}</div>}
              </div>

              <button type="submit" style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #2A9D8F 0%, #1d7a6e 100%)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(42,157,143,0.35)',
              }}>{profiles.length === 0 ? '🚀 Get Started' : '✅ Create Profile'}</button>
            </form>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 8, padding: '16px 20px 28px', flexWrap: 'wrap' }}>
        {['✈️ US · CA · EU', '🐶 Dogs & Cats', '📋 Checklists', '📱 Works offline'].map(pill => (
          <div key={pill} style={{ padding: '5px 12px', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.65)', border: '1px solid rgba(42,130,110,0.15)', fontSize: 11, color: '#3a7060', fontWeight: 500 }}>{pill}</div>
        ))}
      </div>
    </div>
  );
}
