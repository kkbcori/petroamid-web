import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { Colors } from '../utils/theme';

const LOGO    = `${import.meta.env.BASE_URL}logo.jpg`;
const AVATARS = ['🐶','🐱','🦮','🐕','🐈','🐩','🦜','🐇','🐾','🌍'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profiles, createProfile, switchProfile, activeProfileId } = useProfileStore();

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
    // patch emoji since createProfile picks randomly
    useProfileStore.getState().updateProfile(p.id, { avatarEmoji: chosenEmoji });
    navigate('/');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${Colors.navy} 0%, #d4f0ec 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src={LOGO} alt="PetRoamID"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          style={{ width: 130, height: 130, borderRadius: 28, objectFit: 'cover',
            boxShadow: '0 12px 40px rgba(42,157,143,0.35)', display: 'block', margin: '0 auto 14px' }} />
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, color: Colors.cream, marginBottom: 6 }}>
          PetRoamID
        </h1>
        <p style={{ color: Colors.creammid, fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>
          International pet travel compliance — all data stored on your device
        </p>
      </div>

      <div style={{
        background: Colors.navyMid, borderRadius: 24, padding: 28,
        width: '100%', maxWidth: 400, boxShadow: `0 16px 48px ${Colors.shadow}`,
      }}>
        {/* Existing profiles */}
        {!creating && profiles.length > 0 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: Colors.cream, marginBottom: 16, textAlign: 'center' }}>
              Who's travelling?
            </h2>
            {profiles.map(p => (
              <button key={p.id} onClick={() => switchProfile(p.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 14, marginBottom: 10,
                background: Colors.navyLight, border: `1px solid ${Colors.border}`,
                cursor: 'pointer', textAlign: 'left',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#2A9D8F')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = Colors.border)}>
                <span style={{ fontSize: 32 }}>{p.avatarEmoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: Colors.cream }}>{p.displayName}</div>
                  <div style={{ fontSize: 11, color: Colors.creammid }}>
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', color: Colors.creammid }}>›</span>
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${Colors.border}`, marginTop: 4, paddingTop: 14 }}>
              <button onClick={() => setCreating(true)} style={{
                width: '100%', padding: '11px', borderRadius: 12,
                background: 'transparent', border: `1px dashed ${Colors.border}`,
                color: Colors.creammid, fontSize: 14, cursor: 'pointer',
              }}>+ New Profile</button>
            </div>
          </>
        )}

        {/* Create profile form */}
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
                {profiles.length === 0 ? 'Welcome 👋' : 'New Profile'}
              </h2>
            </div>

            {/* Avatar picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: Colors.creammid, marginBottom: 8 }}>
                Pick an avatar
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {AVATARS.map(e => (
                  <button key={e} type="button" onClick={() => setChosenEmoji(e)} style={{
                    fontSize: 24, width: 42, height: 42, borderRadius: 10,
                    border: `2px solid ${chosenEmoji === e ? '#2A9D8F' : Colors.border}`,
                    background: chosenEmoji === e ? 'rgba(42,157,143,0.12)' : Colors.navyLight,
                    cursor: 'pointer',
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
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: `1px solid ${error ? Colors.red : Colors.border}`,
                  background: Colors.navyLight, fontSize: 15, color: Colors.cream,
                }} />
              {error && <div style={{ fontSize: 12, color: Colors.red, marginTop: 4 }}>{error}</div>}
            </div>

            <button type="submit" style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: '#2A9D8F', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            }}>
              {profiles.length === 0 ? '🐾 Get Started' : '✅ Create Profile'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: Colors.creammid, marginTop: 14, lineHeight: 1.5 }}>
              All data stays on this device. Use Settings → Export to back up or transfer to another device.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
