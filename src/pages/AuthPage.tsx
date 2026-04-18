import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../utils/theme';

// Vite resolves public/ assets via BASE_URL
const LOGO = `${import.meta.env.BASE_URL}logo.jpg`;

type Tab = 'signin' | 'magic';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signInMagic, isLoggedIn, mode } = useAuthStore();

  const [tab,      setTab]      = useState<Tab>('signin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    if (isLoggedIn()) navigate('/', { replace: true });
  }, [isLoggedIn()]); // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);

    if (tab === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate('/');
    } else {
      const { error } = await signInMagic(email);
      if (error) setError(error.message);
      else setInfo('✅ Magic link sent! Check your inbox and click the link to sign in.');
    }
    setBusy(false);
  }

  const loading = mode === 'loading' || busy;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${Colors.navy} 0%, #d4f0ec 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img
          src={LOGO}
          alt="PetRoamID"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          style={{
            width: 130, height: 130, borderRadius: 28, objectFit: 'cover',
            boxShadow: '0 12px 40px rgba(42,157,143,0.35)', marginBottom: 14,
            display: 'block', margin: '0 auto 14px',
          }}
        />
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, color: Colors.cream, marginBottom: 6 }}>
          PetRoamID
        </h1>
        <p style={{ color: Colors.creammid, fontSize: 15, maxWidth: 300, lineHeight: 1.5 }}>
          International pet travel compliance — synced across all your devices
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: Colors.navyMid, borderRadius: 24, padding: 28,
        width: '100%', maxWidth: 400,
        boxShadow: `0 16px 48px ${Colors.shadow}`,
      }}>
        {/* Tabs — Sign In / Magic Link only */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: Colors.navyLight, borderRadius: 12, padding: 4 }}>
          {([['signin', '🔑 Sign In'], ['magic', '✉️ Magic Link']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setInfo(''); }} style={{
              flex: 1, padding: '9px 4px', borderRadius: 10, border: 'none',
              background: tab === t ? Colors.navyMid : 'transparent',
              color: tab === t ? '#2A9D8F' : Colors.creammid,
              fontWeight: tab === t ? 700 : 400,
              fontSize: 14, cursor: 'pointer',
              boxShadow: tab === t ? `0 1px 4px ${Colors.shadow}` : 'none',
              transition: 'all .15s',
            }}>{label}</button>
          ))}
        </div>

        {error && (
          <div style={{ background: Colors.redBg, color: Colors.red, padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}
        {info && (
          <div style={{ background: Colors.greenBg, color: Colors.green, padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="Email" value={email} onChange={setEmail} type="email"
            placeholder="you@example.com" autoFocus />

          {tab === 'signin' && (
            <Field label="Password" value={password} onChange={setPassword}
              type="password" placeholder="Your password" />
          )}

          {tab === 'magic' && (
            <div style={{ padding: '10px 12px', background: Colors.navyLight, borderRadius: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: Colors.creammid, lineHeight: 1.6, margin: 0 }}>
                We'll send a one-click sign-in link to your email — no password needed.
                Works on any device including your phone.
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: loading ? Colors.border : '#2A9D8F',
            color: '#fff', fontWeight: 700, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background .15s',
          }}>
            {loading
              ? '⏳ Please wait…'
              : tab === 'signin' ? '→ Sign In' : '✉️ Send Magic Link'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '12px 14px', background: Colors.navyLight, borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: Colors.creammid, marginBottom: 4 }}>
            🔄 Cross-device sync
          </div>
          <p style={{ fontSize: 12, color: Colors.creammid, lineHeight: 1.6, margin: 0 }}>
            Sign in with the same account on your phone, tablet, and computer.
            All pet and trip data syncs automatically.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: Colors.creammid, marginTop: 16 }}>
          No account yet? Use Magic Link — it creates one automatically.
        </p>
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: Colors.creammid, textAlign: 'center' }}>
        Powered by Supabase · Encrypted in transit · Your data is yours
      </p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoFocus?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: Colors.creammid, marginBottom: 5 }}>
        {label}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)}
        type={type} placeholder={placeholder} autoFocus={autoFocus}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          border: `1px solid ${Colors.border}`, background: Colors.navyLight,
          fontSize: 15, color: Colors.cream,
        }} />
    </div>
  );
}
