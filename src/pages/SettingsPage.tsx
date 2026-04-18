import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useData } from '../store/AppContext';
import { pullFromCloud, pushToCloud, downloadJSON, importJSON } from '../lib/syncService';
import { Colors } from '../utils/theme';

export default function SettingsPage() {
  const navigate = useNavigate();
  const auth     = useAuthStore();
  const data     = useData();
  const uid      = auth.userId()!;

  const [msg,      setMsg]      = useState('');
  const [err,      setErr]      = useState('');
  const [clearing, setClearing] = useState(false);
  const [pulling,  setPulling]  = useState(false);
  const [pushing,  setPushing]  = useState(false);

  function flash(type: 'ok' | 'err', text: string) {
    if (type === 'ok') { setMsg(text); setErr(''); }
    else               { setErr(text); setMsg(''); }
    setTimeout(() => { setMsg(''); setErr(''); }, 4000);
  }

  async function handlePull() {
    setPulling(true);
    auth.setSyncStatus('syncing');
    const cloud = await pullFromCloud(uid);
    if (cloud) {
      data.importFromJSON(JSON.stringify({ pets: cloud.pets, trips: cloud.trips, purchases: cloud.purchases }));
      auth.setSyncStatus('synced');
      flash('ok', `✅ Pulled ${cloud.pets.length} pets and ${cloud.trips.length} trips from cloud (saved ${new Date(cloud.updatedAt).toLocaleString()})`);
    } else {
      auth.setSyncStatus('error', 'No cloud data found');
      flash('err', '⚠️ No cloud data found. Data may not have been pushed yet.');
    }
    setPulling(false);
  }

  async function handlePush() {
    setPushing(true);
    auth.setSyncStatus('syncing');
    const { error } = await pushToCloud(uid, { pets: data.pets, trips: data.trips, purchases: data.purchases });
    if (error) {
      auth.setSyncStatus('error', error);
      flash('err', '❌ Push failed: ' + error);
    } else {
      auth.setSyncStatus('synced');
      flash('ok', `✅ Pushed ${data.pets.length} pets and ${data.trips.length} trips to cloud.`);
    }
    setPushing(false);
  }

  async function handleExportJSON() {
    downloadJSON({ pets: data.pets, trips: data.trips, purchases: data.purchases }, auth.displayName());
    flash('ok', '✅ Backup file downloaded.');
  }

  async function handleImportJSON() {
    try {
      setErr('');
      const imported = await importJSON();
      data.importFromJSON(JSON.stringify(imported));
      flash('ok', `✅ Imported ${imported.pets.length} pets and ${imported.trips.length} trips.`);
    } catch (e) {
      if (!String(e).includes('No file')) flash('err', '❌ ' + String(e));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/')} style={{
          background: Colors.navyLight, border: 'none', borderRadius: 10,
          padding: '8px 12px', cursor: 'pointer', color: Colors.creammid, fontSize: 14,
        }}>← Back</button>
        <h1 style={{ fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif" }}>Settings</h1>
      </div>

      {/* Messages */}
      {msg && <div style={{ background: Colors.greenBg, color: Colors.green, padding: '12px 16px', borderRadius: 12, marginBottom: 14, fontSize: 14 }}>{msg}</div>}
      {err && <div style={{ background: Colors.redBg,  color: Colors.red,   padding: '12px 16px', borderRadius: 12, marginBottom: 14, fontSize: 14 }}>{err}</div>}

      {/* Account */}
      <Section title="👤 Account">
        <Row label="Signed in as" value={auth.displayName()} />
        <Row label="Sync status"  value={
          auth.syncStatus === 'synced'  ? '✅ All changes saved to cloud' :
          auth.syncStatus === 'syncing' ? '🔄 Syncing…' :
          auth.syncStatus === 'error'   ? '⚠️ Sync error — try manual push' :
          '☁️ Connected'
        } />
        <button onClick={() => { auth.signOut().then(() => navigate('/login')); }} style={{
          marginTop: 10, padding: '9px 18px', borderRadius: 10,
          background: Colors.navyLight, border: `1px solid ${Colors.border}`,
          color: Colors.cream, fontWeight: 600, cursor: 'pointer', fontSize: 14,
        }}>🚪 Sign Out</button>
      </Section>

      {/* Cloud sync */}
      <Section title="☁️ Supabase Cloud Sync">
        <p style={{ fontSize: 13, color: Colors.creammid, lineHeight: 1.6, marginBottom: 16 }}>
          Your data syncs automatically whenever you make changes. Use the buttons below to force a manual sync or resolve conflicts.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <button onClick={handlePull} disabled={pulling} style={syncBtn('#2A9D8F', 'rgba(42,157,143,0.12)')}>
            {pulling ? '⏳ Pulling…' : '⬇️  Pull from Cloud'}
          </button>
          <button onClick={handlePush} disabled={pushing} style={syncBtn(Colors.gold, Colors.goldLight)}>
            {pushing ? '⏳ Pushing…' : '⬆️  Push to Cloud'}
          </button>
        </div>
        <div style={{ padding: '12px 14px', background: Colors.navyLight, borderRadius: 10, fontSize: 12, color: Colors.creammid, lineHeight: 1.6 }}>
          📱 <strong>Android / iOS →</strong> Sign in with the same email. Data syncs automatically on login.<br/>
          🌐 <strong>Multiple browsers →</strong> Same account = same data everywhere, always up to date.
        </div>
      </Section>

      {/* Offline backup */}
      <Section title="💾 Offline Backup">
        <p style={{ fontSize: 13, color: Colors.creammid, marginBottom: 12, lineHeight: 1.5 }}>
          Export a <code>.petroamid</code> JSON file as an offline backup or to transfer data manually.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={handleExportJSON} style={syncBtn(Colors.teal, Colors.tealGlow)}>
            ⬇️  Export JSON
          </button>
          <button onClick={handleImportJSON} style={syncBtn(Colors.orange, Colors.orangeBg)}>
            ⬆️  Import JSON
          </button>
        </div>
      </Section>

      {/* Data summary */}
      <Section title="📊 Your Data">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          <Stat label="Pets"       value={data.pets.length} />
          <Stat label="Trips"      value={data.trips.length} />
          <Stat label="Unlocked"   value={data.trips.filter(t => t.isPremium).length} />
        </div>
        <button onClick={() => setClearing(true)} style={{
          padding: '8px 16px', borderRadius: 10,
          background: Colors.redBg, border: `1px solid ${Colors.red}33`,
          color: Colors.red, fontWeight: 600, cursor: 'pointer', fontSize: 13,
        }}>🗑 Clear Local Data</button>
        {clearing && (
          <div style={{ marginTop: 12, padding: '12px 14px', background: Colors.redBg, borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: Colors.red, marginBottom: 10 }}>
              This clears local data only. Your cloud backup remains safe. Continue?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setClearing(false)} style={{
                padding: '7px 14px', borderRadius: 8, background: Colors.navyMid,
                border: `1px solid ${Colors.border}`, cursor: 'pointer', fontSize: 13,
              }}>Cancel</button>
              <button onClick={() => { data.clearAll(); setClearing(false); flash('ok', '✅ Local data cleared. Pull from cloud to restore.'); }} style={{
                padding: '7px 14px', borderRadius: 8, background: Colors.red,
                border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13,
              }}>Clear Local</button>
            </div>
          </div>
        )}
      </Section>

      <div style={{ textAlign: 'center', fontSize: 11, color: Colors.creammid, padding: '16px 0' }}>
        PetRoamID v1.1 · Synced via Supabase · All data encrypted in transit
      </div>
    </div>
  );
}

function syncBtn(color: string, bg: string): React.CSSProperties {
  return {
    padding: '13px 10px', borderRadius: 12,
    background: bg, border: `1px solid ${color}44`,
    color: color, fontWeight: 700, cursor: 'pointer', fontSize: 13,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: Colors.cream }}>{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${Colors.borderLight}` }}>
      <span style={{ fontSize: 13, color: Colors.creammid }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: Colors.cream }}>{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: Colors.navyLight, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#2A9D8F' }}>{value}</div>
      <div style={{ fontSize: 11, color: Colors.creammid }}>{label}</div>
    </div>
  );
}
