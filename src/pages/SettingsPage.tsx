import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { useProfileStore } from '../store/profileStore';
import { Colors } from '../utils/theme';
import { SettingsBanner } from '../components/Illustrations';

export default function SettingsPage() {
  const navigate    = useNavigate();
  const data        = useData();
  const { activeProfile, deleteProfile, updateProfile } = useProfileStore();
  const profile     = activeProfile();

  const [showClearConfirm,  setShowClearConfirm]  = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName,          setEditName]          = useState(false);
  const [nameInput,         setNameInput]         = useState(profile?.displayName ?? '');
  const [importMsg,         setImportMsg]         = useState('');

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport() {
    const json     = data.exportAsJSON();
    const blob     = new Blob([json], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `petroamid-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import ────────────────────────────────────────────────────────────────
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = data.importFromJSON(ev.target?.result as string);
      setImportMsg(result.success ? '✅ Data restored successfully!' : `❌ ${result.error}`);
      setTimeout(() => setImportMsg(''), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ── Clear all data ────────────────────────────────────────────────────────
  function handleClearAll() {
    data.clearAll();
    setShowClearConfirm(false);
  }

  // ── Delete profile ────────────────────────────────────────────────────────
  function handleDeleteProfile() {
    if (!profile) return;
    try { localStorage.removeItem(`petroamid-${profile.id}`); } catch {}
    deleteProfile(profile.id);
    navigate('/profile');
  }

  // ── Update name ───────────────────────────────────────────────────────────
  function handleSaveName() {
    if (profile && nameInput.trim()) {
      updateProfile(profile.id, { displayName: nameInput.trim() });
    }
    setEditName(false);
  }

  const stats = {
    pets:      data.pets.length,
    trips:     data.trips.length,
    purchases: data.purchases.length,
  };

  return (
    <div>
      <SettingsBanner />

      {/* ── Profile card ── */}
      <Section title="👤 Profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(42,157,143,0.15)', border: '2px solid #2A9D8F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            {profile?.avatarEmoji ?? '👤'}
          </div>
          <div style={{ flex: 1 }}>
            {editName ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid #2A9D8F`, background: Colors.navyLight, color: Colors.cream, fontSize: 14 }}
                />
                <button onClick={handleSaveName} style={{ padding: '8px 14px', borderRadius: 8, background: '#2A9D8F', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditName(false)} style={{ padding: '8px 14px', borderRadius: 8, background: Colors.navyLight, border: `1px solid ${Colors.border}`, color: Colors.cream, cursor: 'pointer' }}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: Colors.cream }}>{profile?.displayName}</span>
                <button onClick={() => { setNameInput(profile?.displayName ?? ''); setEditName(true); }} style={{ fontSize: 12, color: '#2A9D8F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
              </div>
            )}
            <div style={{ fontSize: 12, color: Colors.creammid, marginTop: 3 }}>📱 {stats.pets} pet{stats.pets !== 1 ? 's' : ''} · {stats.trips} trip{stats.trips !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </Section>

      {/* ── Backup & Restore ── */}
      <Section title="💾 Backup & Restore">
        <p style={{ fontSize: 13, color: Colors.creammid, marginBottom: 14, lineHeight: 1.5 }}>
          Export your pets, trips and vaccination records as a JSON file. Import to restore on any device.
        </p>
        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
          <button onClick={handleExport} style={btnStyle('#2A9D8F')}>
            ⬆️ Export Backup
          </button>
          <label style={{ ...btnStyle(Colors.blue), textAlign: 'center', cursor: 'pointer' }}>
            ⬇️ Import Backup
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
        {importMsg && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: importMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : Colors.redBg, color: importMsg.startsWith('✅') ? Colors.green : Colors.red, fontSize: 13, fontWeight: 600 }}>
            {importMsg}
          </div>
        )}
      </Section>

      {/* ── Clear Data ── */}
      <Section title="🗑️ Clear All Data">
        <p style={{ fontSize: 13, color: Colors.creammid, marginBottom: 14, lineHeight: 1.5 }}>
          Removes all pets, trips and purchases from this profile. Your profile itself is kept.
        </p>
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)} style={outlineBtn(Colors.orange)}>
            Clear All Data
          </button>
        ) : (
          <ConfirmBox
            message="This will delete all your pets, trips and checklists. Cannot be undone."
            onCancel={() => setShowClearConfirm(false)}
            onConfirm={handleClearAll}
            confirmLabel="Yes, Clear All"
            confirmColor={Colors.orange}
          />
        )}
      </Section>

      {/* ── Delete Profile ── */}
      <Section title="❌ Delete Profile">
        <p style={{ fontSize: 13, color: Colors.creammid, marginBottom: 14, lineHeight: 1.5 }}>
          Permanently deletes this profile and all its pets, trips and data. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} style={outlineBtn(Colors.red)}>
            Delete Profile
          </button>
        ) : (
          <ConfirmBox
            message={`Delete "${profile?.displayName}"? All data will be permanently lost.`}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteProfile}
            confirmLabel="Yes, Delete Profile"
            confirmColor={Colors.red}
          />
        )}
      </Section>

      {/* ── About ── */}
      <div style={{ textAlign: 'center', padding: '24px 0 8px', color: Colors.creammid, fontSize: 12 }}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>🐾</div>
        <div style={{ fontWeight: 700, color: Colors.cream }}>PetRoamID v2.0</div>
        <div style={{ marginTop: 4 }}>Your pet travel compliance companion</div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: Colors.cream, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

function ConfirmBox({ message, onCancel, onConfirm, confirmLabel, confirmColor }: {
  message: string; onCancel: () => void; onConfirm: () => void; confirmLabel: string; confirmColor: string;
}) {
  return (
    <div style={{ background: `${confirmColor}18`, borderRadius: 12, padding: 16, border: `1px solid ${confirmColor}55` }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: confirmColor, marginBottom: 14, textAlign: 'center', lineHeight: 1.5 }}>
        ⚠️ {message}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 10, background: Colors.navyLight, border: `1px solid ${Colors.border}`, color: Colors.cream, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 10, background: confirmColor, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return { width: '100%', padding: '12px', borderRadius: 12, background: bg, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'block' };
}

function outlineBtn(color: string): React.CSSProperties {
  return { width: '100%', padding: '12px', borderRadius: 12, background: 'transparent', border: `2px solid ${color}`, color, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
}
