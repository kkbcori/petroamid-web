import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { useData } from '../store/AppContext';
import { downloadBundle, importBundle } from '../lib/syncService';
import { Colors } from '../utils/theme';
import type { Trip } from '../store/appStore';
import { SettingsBanner, SETTINGS_COLOR } from '../components/Illustrations';

const AVATARS = ['🐶','🐱','🦮','🐕','🐈','🐩','🦜','🐇','🐾','🌍'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { activeProfile, updateProfile, deleteProfile, logout, profiles } = useProfileStore();
  const data     = useData();
  const profile  = activeProfile();

  const [editName,  setEditName]  = useState(profile?.displayName ?? '');
  const [saved,     setSaved]     = useState(false);
  const [msg,       setMsg]       = useState('');
  const [err,       setErr]       = useState('');
  const [clearing,  setClearing]  = useState(false);
  const [delProf,   setDelProf]   = useState(false);

  function flash(type: 'ok' | 'err', text: string) {
    if (type === 'ok') { setMsg(text); setErr(''); } else { setErr(text); setMsg(''); }
    setTimeout(() => { setMsg(''); setErr(''); }, 4000);
  }

  function handleSaveProfile() {
    if (!profile || !editName.trim()) return;
    updateProfile(profile.id, { displayName: editName.trim() });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    if (!profile) return;
    downloadBundle({ version: 2, exportedAt: new Date().toISOString(), profile, pets: data.pets, trips: data.trips, purchases: data.purchases });
    flash('ok', '✅ Backup downloaded! Transfer to another device and import to restore.');
  }

  async function handleImport() {
    try {
      const bundle = await importBundle();
      data.importFromJSON(JSON.stringify({ pets: bundle.pets, trips: bundle.trips, purchases: bundle.purchases }));
      flash('ok', `✅ Imported ${bundle.pets.length} pets and ${bundle.trips.length} trips.`);
    } catch (e) {
      if (!String(e).includes('No file')) flash('err', '❌ ' + String(e));
    }
  }

  return (
    <div>
      <SettingsBanner />

      {msg && <div style={{ background: Colors.greenBg, color: Colors.green, padding: '12px 16px', borderRadius: 12, marginBottom: 14, fontSize: 14 }}>{msg}</div>}
      {err && <div style={{ background: Colors.redBg,  color: Colors.red,   padding: '12px 16px', borderRadius: 12, marginBottom: 14, fontSize: 14 }}>{err}</div>}

      <Card title="👤 Profile">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {AVATARS.map(e => (
            <button key={e} onClick={() => profile && updateProfile(profile.id, { avatarEmoji: e })} style={{
              fontSize: 22, width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${profile?.avatarEmoji === e ? '#B45309' : Colors.border}`,
              background: profile?.avatarEmoji === e ? SETTINGS_COLOR : Colors.navyLight,
            }}>{e}</button>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: Colors.creammid, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Name</label>
          <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }}
            onFocus={e => (e.target.style.borderColor = '#B45309')}
            onBlur={e => (e.target.style.borderColor = Colors.border)} />
        </div>
        <button onClick={handleSaveProfile} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: saved ? Colors.green : '#B45309', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          {saved ? '✅ Saved!' : 'Save Profile'}
        </button>
      </Card>

      <Card title="💾 Backup & Transfer">
        <p style={{ fontSize: 13, color: Colors.creammid, lineHeight: 1.6, marginBottom: 14 }}>
          Export a <code>.petroamid</code> file to back up or move data to another device.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <button onClick={handleExport} style={sBtn('#B45309', SETTINGS_COLOR)}>⬇️  Export Backup</button>
          <button onClick={handleImport} style={sBtn('#8B5E00', '#FFF3E0')}>⬆️  Import Backup</button>
        </div>
        <div style={{ padding: '12px 14px', background: SETTINGS_COLOR, borderRadius: 10, fontSize: 12, color: '#5c3400', lineHeight: 1.7, border: '1px solid rgba(0,0,0,0.06)' }}>
          <strong>📱 Web → Phone:</strong> Export here → email file → import in PetRoamID app<br />
          <strong>📱 Phone → Web:</strong> Export in phone app → email file → import here<br />
          <strong>🌐 Web → Web:</strong> Export in source browser → import in target browser
        </div>
      </Card>

      <Card title="📊 Data">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          <Stat label="Pets"     value={data.pets.length}                                         color="#B45309" />
          <Stat label="Trips"    value={data.trips.length}                                        color="#B45309" />
          <Stat label="Unlocked" value={data.trips.filter((t: Trip) => t.isPremium).length}       color="#B45309" />
        </div>
        <button onClick={() => setClearing(true)} style={{ padding: '8px 14px', borderRadius: 10, background: Colors.redBg, border: `1px solid ${Colors.red}33`, color: Colors.red, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>🗑 Clear All Data</button>
        {clearing && (
          <div style={{ marginTop: 10, padding: '12px 14px', background: Colors.redBg, borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: Colors.red, marginBottom: 10 }}>Permanently deletes all pets and trips. Export first to save a backup.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setClearing(false)} style={{ padding: '7px 14px', borderRadius: 8, background: Colors.navyMid, border: `1px solid ${Colors.border}`, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={() => { data.clearAll(); setClearing(false); flash('ok', '✅ Cleared.'); }} style={{ padding: '7px 14px', borderRadius: 8, background: Colors.red, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Delete Everything</button>
            </div>
          </div>
        )}
      </Card>

      <Card title="👥 Profiles">
        {profiles.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${Colors.borderLight}` }}>
            <span style={{ fontSize: 22 }}>{p.avatarEmoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: p.id === profile?.id ? 700 : 400 }}>{p.displayName}</span>
            {p.id === profile?.id
              ? <span style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>Active</span>
              : <button onClick={() => { useProfileStore.getState().switchProfile(p.id); navigate('/'); }} style={{ fontSize: 12, color: Colors.teal, background: 'none', border: `1px solid ${Colors.border}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>Switch</button>
            }
          </div>
        ))}
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <button onClick={() => { logout(); navigate('/profile'); }} style={{ padding: '8px 14px', borderRadius: 10, background: Colors.navyLight, border: `1px solid ${Colors.border}`, color: Colors.cream, cursor: 'pointer', fontSize: 13 }}>+ Add Profile</button>
          {profiles.length > 1 && (
            <button onClick={() => setDelProf(true)} style={{ padding: '8px 14px', borderRadius: 10, background: Colors.redBg, border: `1px solid ${Colors.red}33`, color: Colors.red, cursor: 'pointer', fontSize: 13 }}>Delete This Profile</button>
          )}
        </div>
        {delProf && profile && (
          <div style={{ marginTop: 10, padding: '12px 14px', background: Colors.redBg, borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: Colors.red, marginBottom: 10 }}>Delete "{profile.displayName}" and all their data?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDelProf(false)} style={{ padding: '7px 14px', borderRadius: 8, background: Colors.navyMid, border: `1px solid ${Colors.border}`, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={() => { deleteProfile(profile.id); logout(); navigate('/profile'); }} style={{ padding: '7px 14px', borderRadius: 8, background: Colors.red, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Delete</button>
            </div>
          </div>
        )}
      </Card>

      <div style={{ textAlign: 'center', fontSize: 11, color: Colors.creammid, padding: '16px 0' }}>
        PetRoamID v2.0 · Local-only · No account required · No data leaves your device
      </div>
    </div>
  );
}

function sBtn(color: string, bg: string): React.CSSProperties {
  return { padding: '13px 10px', borderRadius: 12, background: bg, border: `1px solid ${color}44`, color, fontWeight: 700, cursor: 'pointer', fontSize: 13 };
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: Colors.cream }}>{title}</h2>
      {children}
    </div>
  );
}
function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: Colors.navyLight, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: Colors.creammid }}>{label}</div>
    </div>
  );
}
