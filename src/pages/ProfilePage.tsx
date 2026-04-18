import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { Colors } from '../utils/theme';
import logoUrl from '../assets/logo.jpg';
import { WelcomeScene, WELCOME_COLOR } from '../components/Illustrations';

const AVATARS = ['🐶','🐱','🦮','🐕','🐈','🐩','🦜','🐇','🐾','🌍'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profiles, createProfile, switchProfile, activeProfileId, updateProfile } = useProfileStore();
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
    <div style={{ minHeight: '100vh', background: WELCOME_COLOR, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Full-screen illustration background (bottom half) ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', zIndex: 0 }}>
        <WelcomeScene />
      </div>

      {/* ── Top: Logo + brand ── */}
      <div style={{ position: 'relative', zIndex: 2, padding: '36px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoUrl} alt="PetRoamID" style={{
            width: 42, height: 42, borderRadius: 10, objectFit: 'cover',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>
            PetRoamID
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6, marginLeft: 52 }}>
          International pet travel compliance
        </p>
      </div>

      {/* ── Main card (glass effect, centered) ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '28px 20px 0',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
          borderRadius: 24, padding: 26, width: '100%', maxWidth: 400,
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}>

          {/* Profile list */}
          {!creating && profiles.length > 0 && (
            <>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: Colors.cream, marginBottom: 4 }}>
                Who's travelling? 🌍
              </h2>
              <p style={{ fontSize: 13, color: Colors.creammid, marginBottom: 16 }}>Select your profile to continue</p>
              {profiles.map(p => (
                <button key={p.id} onClick={() => switchProfile(p.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14, marginBottom: 10,
                  background: Colors.navyLight, border: `1.5px solid ${Colors.border}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D4DD4'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = Colors.border; e.currentTarget.style.transform = 'none'; }}>
                  <span style={{ fontSize: 32 }}>{p.avatarEmoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: Colors.cream }}>{p.displayName}</div>
                    <div style={{ fontSize: 11, color: Colors.creammid }}>
                      Joined {new Date(p.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ color: '#2D4DD4', fontSize: 20, fontWeight: 700 }}>›</div>
                </button>
              ))}
              <button onClick={() => setCreating(true)} style={{
                width: '100%', padding: '11px', borderRadius: 12, marginTop: 4,
                background: 'transparent', border: `1.5px dashed ${Colors.border}`,
                color: Colors.creammid, fontSize: 14, cursor: 'pointer',
              }}>+ New Profile</button>
            </>
          )}

          {/* Create form */}
          {creating && (
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                {profiles.length > 0 && (
                  <button type="button" onClick={() => { setCreating(false); setError(''); }} style={{
                    background: Colors.navyLight, border: 'none', borderRadius: 8,
                    padding: '6px 10px', cursor: 'pointer', color: Colors.creammid, fontSize: 13,
                  }}>← Back</button>
                )}
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 700, color: Colors.cream }}>
                    {profiles.length === 0 ? "Let's get started! 🐾" : 'New Profile'}
                  </h2>
                  <p style={{ fontSize: 12, color: Colors.creammid }}>No account needed — stays on your device</p>
                </div>
              </div>

              {/* Avatar grid */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: Colors.creammid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pick your avatar
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {AVATARS.map(e => (
                    <button key={e} type="button" onClick={() => setChosenEmoji(e)} style={{
                      fontSize: 24, height: 46, borderRadius: 12,
                      border: `2px solid ${chosenEmoji === e ? '#2D4DD4' : Colors.border}`,
                      background: chosenEmoji === e ? 'rgba(45,77,212,0.1)' : Colors.navyLight,
                      cursor: 'pointer', transform: chosenEmoji === e ? 'scale(1.12)' : 'scale(1)',
                      transition: 'all .12s',
                    }}>{e}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: Colors.creammid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Name *
                </label>
                <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="e.g. Alex" autoFocus style={{
                    width: '100%', padding: '13px 14px', borderRadius: 12,
                    border: `1.5px solid ${error ? Colors.red : Colors.border}`,
                    background: Colors.navyLight, fontSize: 15, color: Colors.cream,
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2D4DD4')}
                  onBlur={e => (e.target.style.borderColor = error ? Colors.red : Colors.border)} />
                {error && <div style={{ fontSize: 12, color: Colors.red, marginTop: 4 }}>{error}</div>}
              </div>

              <button type="submit" style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #2D4DD4 0%, #1e38b0 100%)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(45,77,212,0.4)',
              }}>
                {profiles.length === 0 ? "🚀 Let's Go!" : '✅ Create Profile'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom pill badges */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', gap: 8, padding: '16px 20px 24px',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {['✈️ US · CA · EU', '🐶 Dogs & Cats', '📋 Compliance checklists', '📱 Works offline'].map(pill => (
          <div key={pill} style={{
            padding: '5px 12px', borderRadius: 20,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 500,
          }}>{pill}</div>
        ))}
      </div>
    </div>
  );
}
