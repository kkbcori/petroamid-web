import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { Colors } from '../utils/theme';
import logoUrl from '../assets/logo.jpg';

const AVATARS = ['🐶','🐱','🦮','🐕','🐈','🐩','🦜','🐇','🐾','🌍'];

// Floating background items — travel & pet themed
const BG_ITEMS = [
  { emoji: '✈️', x: 8,  y: 15, size: 28, dur: 18, delay: 0   },
  { emoji: '🐾', x: 20, y: 70, size: 22, dur: 22, delay: 2   },
  { emoji: '🌍', x: 75, y: 20, size: 32, dur: 20, delay: 4   },
  { emoji: '🧳', x: 88, y: 60, size: 26, dur: 25, delay: 1   },
  { emoji: '🐶', x: 50, y: 85, size: 24, dur: 19, delay: 6   },
  { emoji: '🐱', x: 35, y: 40, size: 20, dur: 23, delay: 3   },
  { emoji: '🗺️', x: 65, y: 75, size: 30, dur: 21, delay: 7   },
  { emoji: '💉', x: 15, y: 50, size: 18, dur: 26, delay: 5   },
  { emoji: '🏥', x: 82, y: 35, size: 22, dur: 17, delay: 8   },
  { emoji: '✈️', x: 55, y: 10, size: 24, dur: 24, delay: 9   },
  { emoji: '🐾', x: 92, y: 82, size: 20, dur: 20, delay: 11  },
  { emoji: '🌐', x: 28, y: 90, size: 28, dur: 22, delay: 13  },
  { emoji: '🐕', x: 70, y: 50, size: 22, dur: 18, delay: 2.5 },
  { emoji: '📋', x: 42, y: 25, size: 18, dur: 27, delay: 4.5 },
  { emoji: '🧭', x: 5,  y: 88, size: 26, dur: 16, delay: 7.5 },
];

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
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, #e8f8f5 0%, #fff8f0 50%, #fef3e2 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>

      {/* ── Animated background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {BG_ITEMS.map((item, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: 0.12,
            animation: `floatBg ${item.dur}s ease-in-out ${item.delay}s infinite alternate`,
            userSelect: 'none',
          }}>
            {item.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatBg {
          0%   { transform: translateY(0px)   rotate(-5deg) scale(1);    opacity: 0.08; }
          50%  { transform: translateY(-18px) rotate(3deg)  scale(1.08); opacity: 0.15; }
          100% { transform: translateY(8px)   rotate(-2deg) scale(0.95); opacity: 0.10; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          <img src={logoUrl} alt="PetRoamID" style={{
            width: 130, height: 130, borderRadius: 28, objectFit: 'cover',
            boxShadow: '0 16px 48px rgba(42,157,143,0.30), 0 4px 16px rgba(0,0,0,0.08)',
            display: 'block',
          }} />
          {/* Pulse ring */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: 34,
            border: '2px solid rgba(42,157,143,0.25)',
            animation: 'pulseRing 2.5s ease-in-out infinite',
          }} />
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 34, color: '#1a4a44', marginBottom: 8, letterSpacing: '-0.5px',
        }}>
          PetRoamID
        </h1>
        <p style={{ color: Colors.creammid, fontSize: 15, maxWidth: 300, lineHeight: 1.6 }}>
          International pet travel compliance — all data stored on your device
        </p>
      </div>

      <style>{`
        @keyframes pulseRing {
          0%, 100% { transform: scale(1);    opacity: 0.4; }
          50%       { transform: scale(1.06); opacity: 0.15; }
        }
      `}</style>

      {/* ── Card ── */}
      <div style={{
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderRadius: 24, padding: 28, width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(42,157,143,0.15), 0 4px 16px rgba(0,0,0,0.06)',
        border: '1px solid rgba(42,157,143,0.12)',
        position: 'relative', zIndex: 1,
      }}>

        {/* Profile list */}
        {!creating && profiles.length > 0 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: Colors.cream, marginBottom: 16, textAlign: 'center' }}>
              Who's travelling today?
            </h2>
            {profiles.map(p => (
              <button key={p.id} onClick={() => switchProfile(p.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 14, marginBottom: 10,
                background: Colors.navyLight, border: `1.5px solid ${Colors.border}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A9D8F'; e.currentTarget.style.background = 'rgba(42,157,143,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = Colors.border; e.currentTarget.style.background = Colors.navyLight; }}>
                <span style={{ fontSize: 34 }}>{p.avatarEmoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: Colors.cream }}>{p.displayName}</div>
                  <div style={{ fontSize: 11, color: Colors.creammid }}>
                    Joined {new Date(p.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#2A9D8F',
                }}>›</div>
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${Colors.border}`, marginTop: 4, paddingTop: 14 }}>
              <button onClick={() => setCreating(true)} style={{
                width: '100%', padding: '11px', borderRadius: 12,
                background: 'transparent', border: `1.5px dashed ${Colors.border}`,
                color: Colors.creammid, fontSize: 14, cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A9D8F'; e.currentTarget.style.color = '#2A9D8F'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = Colors.border; e.currentTarget.style.color = Colors.creammid; }}>
                + New Profile
              </button>
            </div>
          </>
        )}

        {/* Create form */}
        {creating && (
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              {profiles.length > 0 && (
                <button type="button" onClick={() => { setCreating(false); setError(''); }} style={{
                  background: Colors.navyLight, border: 'none', borderRadius: 8,
                  padding: '6px 10px', cursor: 'pointer', color: Colors.creammid, fontSize: 13,
                }}>← Back</button>
              )}
              <h2 style={{ fontSize: 18, fontWeight: 700, color: Colors.cream }}>
                {profiles.length === 0 ? '👋 Welcome!' : 'New Profile'}
              </h2>
            </div>

            {/* Avatar grid */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: Colors.creammid, marginBottom: 8 }}>
                Pick your avatar
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {AVATARS.map(e => (
                  <button key={e} type="button" onClick={() => setChosenEmoji(e)} style={{
                    fontSize: 26, height: 48, borderRadius: 12,
                    border: `2px solid ${chosenEmoji === e ? '#2A9D8F' : Colors.border}`,
                    background: chosenEmoji === e ? 'rgba(42,157,143,0.12)' : Colors.navyLight,
                    cursor: 'pointer', transition: 'all .12s',
                    transform: chosenEmoji === e ? 'scale(1.1)' : 'scale(1)',
                  }}>{e}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: Colors.creammid, marginBottom: 6 }}>
                Your Name *
              </label>
              <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="e.g. Alex" autoFocus style={{
                  width: '100%', padding: '13px 14px', borderRadius: 12,
                  border: `1.5px solid ${error ? Colors.red : Colors.border}`,
                  background: Colors.navyLight, fontSize: 15, color: Colors.cream,
                  transition: 'border-color .15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e => (e.target.style.borderColor = error ? Colors.red : Colors.border)} />
              {error && <div style={{ fontSize: 12, color: Colors.red, marginTop: 4 }}>{error}</div>}
            </div>

            <button type="submit" style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #2A9D8F 0%, #21867a 100%)',
              color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(42,157,143,0.35)',
              transition: 'transform .1s, box-shadow .1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,157,143,0.35)'; }}>
              {profiles.length === 0 ? '🐾 Get Started' : '✅ Create Profile'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: Colors.creammid, marginTop: 14, lineHeight: 1.6 }}>
              No account needed · All data stays on this device<br />
              Use Settings → Export to back up anytime
            </p>
          </form>
        )}
      </div>

      {/* Feature pills */}
      <div style={{
        display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {['✈️ US · CA · EU', '🐶 Dogs & Cats', '📋 Official checklists', '📱 Works offline'].map(pill => (
          <div key={pill} style={{
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(42,157,143,0.15)',
            fontSize: 12, color: Colors.creammid, fontWeight: 500,
          }}>{pill}</div>
        ))}
      </div>
    </div>
  );
}
