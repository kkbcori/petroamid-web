import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../utils/theme';

type Tab = 'signin' | 'signup' | 'magic';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInMagic, isLoggedIn, mode } = useAuthStore();

  const [tab,      setTab]      = useState<Tab>('signin');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    if (isLoggedIn()) navigate('/', { replace: true });
  }, [isLoggedIn()]);  // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);

    if (tab === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate('/');

    } else if (tab === 'signup') {
      if (!name.trim()) { setError('Please enter your name'); setBusy(false); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters'); setBusy(false); return; }
      const { error } = await signUp(email, password, name.trim());
      if (error) setError(error.message);
      else {
        setInfo('✅ Check your email for a confirmation link, then sign in.');
        setTab('signin');
      }

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
      {/* Logo hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="./logo.jpg" alt="PetRoamID" style={{
          width: 130, height: 130, borderRadius: 28, objectFit: 'cover',
          boxShadow: '0 12px 40px rgba(42,157,143,0.35)', marginBottom: 14,
        }} />
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
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: Colors.navyLight, borderRadius: 12, padding: 4 }}>
          {([['signin','Sign In'], ['signup','Sign Up'], ['magic','Magic Link']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setInfo(''); }} style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
              background: tab === t ? Colors.navyMid : 'transparent',
              color: tab === t ? Colors.teal : Colors.creammid,
              fontWeight: tab === t ? 700 : 400,
              fontSize: 13, cursor: 'pointer',
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
          {tab === 'signup' && (
            <Field label="Your Name" value={name} onChange={setName} placeholder="Alex Smith" autoFocus />
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoFocus={tab !== 'signup'} />
          {tab !== 'magic' && (
            <Field label="Password" value={password} onChange={setPassword} type="password"
              placeholder={tab === 'signup' ? 'Min. 8 characters' : 'Your password'} />
          )}

          {tab === 'magic' && (
            <p style={{ fontSize: 12, color: Colors.creammid, marginBottom: 16, lineHeight: 1.5 }}>
              We'll email you a one-click sign-in link — no password needed. Works on any device.
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: loading ? Colors.border : Colors.teal,
            color: '#fff', fontWeight: 700, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background .15s',
          }}>
            {loading ? '⏳ Please wait…' : tab === 'signin' ? '→ Sign In' : tab === 'signup' ? '✨ Create Account' : '✉️ Send Magic Link'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '14px 16px', background: Colors.navyLight, borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: Colors.creammid, marginBottom: 6 }}>🔄 Cross-device sync</div>
          <p style={{ fontSize: 12, color: Colors.creammid, lineHeight: 1.6 }}>
            Sign in with the same account on your phone, tablet, and computer. All data syncs automatically in real time.
          </p>
        </div>
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
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: Colors.creammid, marginBottom: 5 }}>{label}</label>
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
