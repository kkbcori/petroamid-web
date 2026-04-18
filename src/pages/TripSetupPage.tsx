import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import { COUNTRIES, buildTravelScenario, type DestinationCountry } from '../data/travelRequirements';
import type { Trip, Pet } from '../store/appStore';
import { v4 as uuid } from 'uuid';

const DESTS = [
  { code: 'US' as DestinationCountry, flag: '🇺🇸', name: 'United States' },
  { code: 'CA' as DestinationCountry, flag: '🇨🇦', name: 'Canada' },
  { code: 'EU' as DestinationCountry, flag: '🇪🇺', name: 'European Union' },
];

export default function TripSetupPage() {
  const navigate = useNavigate();
  const { pets, trips, addTrip } = useData();
  const [petId, setPetId]             = useState(pets[0]?.id ?? '');
  const [destination, setDestination] = useState<DestinationCountry>('US');
  const [origin, setOrigin]           = useState('US');
  const [travelDate, setTravelDate]   = useState('');
  const [isUSVacc, setIsUSVacc]       = useState(false);
  const [tripName, setTripName]       = useState('');
  const [error, setError]             = useState('');

  const selectedPet   = pets.find((p: Pet) => p.id === petId);
  const originCountry = COUNTRIES.find(c => c.code === origin);
  const freeTripUsed  = trips.some((t: Trip) => !t.isPremium);

  function handleCreate() {
    if (!petId)      { setError('Select a pet'); return; }
    if (!travelDate) { setError('Select a travel date'); return; }
    if (freeTripUsed) { setError('Free plan: 1 trip allowed. Unlock existing trip first.'); return; }
    const scenario = buildTravelScenario({ destination, originCountryCode: origin, petType: selectedPet?.species ?? 'dog', isUSVaccinated: destination === 'US' ? isUSVacc : undefined });
    const trip: Trip = { id: uuid(), petId, petIds: [petId], originCountryCode: origin, destination, travelDate,
      isUSVaccinated: destination === 'US' ? isUSVacc : undefined, scenario, checklist: scenario.checklist,
      checklistState: {}, createdAt: new Date().toISOString(), isPremium: false, tripName: tripName.trim() || undefined };
    addTrip(trip);
    navigate(`/trips/${trip.id}`);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ background: Colors.navyLight, border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: Colors.creammid, fontSize: 14 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif" }}>Plan a Trip</h1>
      </div>
      {pets.length === 0 && <div style={{ background: Colors.yellowBg, color: Colors.yellow, padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 14 }}>⚠️ Add a pet first. <button onClick={() => navigate('/pets/add')} style={{ color: Colors.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Add pet →</button></div>}
      {error && <div style={{ background: Colors.redBg, color: Colors.red, padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>{error}</div>}

      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 18, padding: 20, boxShadow: `0 2px 10px ${Colors.shadow}` }}>
        <FF label="Trip Name (optional)" value={tripName} onChange={setTripName} placeholder="e.g. Summer Holiday 2025" />

        <div style={{ marginBottom: 18 }}>
          <FL>Select Pet *</FL>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pets.map((p: Pet) => (<button key={p.id} onClick={() => setPetId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 20, border: `2px solid ${petId === p.id ? Colors.teal : Colors.border}`, background: petId === p.id ? Colors.tealGlow : Colors.navyLight, color: petId === p.id ? Colors.teal : Colors.cream, fontWeight: petId === p.id ? 700 : 400, cursor: 'pointer', fontSize: 14 }}><span>{p.avatarEmoji ?? (p.species === 'cat' ? '🐱' : '🐶')}</span><span>{p.name}</span></button>))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <FL>Travelling From *</FL>
          <select value={origin} onChange={e => setOrigin(e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }}>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          {originCountry && <div style={{ marginTop: 6, fontSize: 12, color: Colors.creammid }}>Risk: <strong>{originCountry.region.replace('_', ' ')}</strong></div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <FL>Destination *</FL>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {DESTS.map(d => (<button key={d.code} onClick={() => setDestination(d.code)} style={{ padding: '12px 8px', borderRadius: 12, textAlign: 'center', border: `2px solid ${destination === d.code ? Colors.teal : Colors.border}`, background: destination === d.code ? Colors.tealGlow : Colors.navyLight, cursor: 'pointer' }}><div style={{ fontSize: 22 }}>{d.flag}</div><div style={{ fontSize: 12, fontWeight: 600, color: destination === d.code ? Colors.teal : Colors.cream, marginTop: 4 }}>{d.code}</div></button>))}
          </div>
        </div>

        {destination === 'US' && selectedPet?.species === 'dog' && (
          <div style={{ marginBottom: 18, padding: '12px 16px', background: Colors.blueBg, borderRadius: 12 }}>
            <FL>Was this dog vaccinated in the US?</FL>
            <div style={{ display: 'flex', gap: 10 }}>
              {([true, false] as const).map(val => (<button key={String(val)} onClick={() => setIsUSVacc(val)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `2px solid ${isUSVacc === val ? Colors.blue : Colors.border}`, background: isUSVacc === val ? Colors.blueBg : Colors.navyLight, color: isUSVacc === val ? Colors.blue : Colors.cream, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>{val ? '✅ Yes' : '❌ No'}</button>))}
            </div>
          </div>
        )}

        <FF label="Travel Date *" value={travelDate} onChange={setTravelDate} type="date" />
        <button onClick={handleCreate} disabled={pets.length === 0} style={{ width: '100%', padding: '14px', borderRadius: 14, marginTop: 8, background: pets.length === 0 ? Colors.border : Colors.teal, color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: pets.length === 0 ? 'not-allowed' : 'pointer' }}>Generate Checklist →</button>
      </div>
      <div style={{ marginTop: 16, padding: '12px 16px', background: Colors.goldLight, borderRadius: 12, fontSize: 13, color: Colors.creammid }}>🔒 Free plan: 1 trip. Microchip item always unlocked. Unlock full checklist per trip.</div>
    </div>
  );
}
function FL({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: Colors.creammid, marginBottom: 6 }}>{children}</label>;
}
function FF({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <FL>{label}</FL>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }} />
    </div>
  );
}
