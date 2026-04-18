import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import { COUNTRIES, buildTravelScenario, type DestinationCountry } from '../data/travelRequirements';
import type { Trip, Pet } from '../store/appStore';
import { v4 as uuid } from 'uuid';
import { TravelBanner, TRAVEL_COLOR } from '../components/Illustrations';

const DESTINATIONS = [
  { code: 'US' as DestinationCountry, flag: '🇺🇸', label: 'United States', desc: 'CDC rules (Aug 2024)' },
  { code: 'CA' as DestinationCountry, flag: '🇨🇦', label: 'Canada',         desc: 'CFIA requirements'   },
  { code: 'EU' as DestinationCountry, flag: '🇪🇺', label: 'European Union', desc: 'EC pet travel rules'  },
];

export default function TripSetupPage() {
  const navigate = useNavigate();
  const { pets, trips, addTrip } = useData();

  // ── Match original: both start empty/null, user must select ──────────────
  const [petId,        setPetId]        = useState(pets.length === 1 ? pets[0].id : '');
  const [destination,  setDestination]  = useState<DestinationCountry | null>(null);
  const [originCode,   setOriginCode]   = useState('');
  const [searchOrigin, setSearchOrigin] = useState('');
  const [travelDate,   setTravelDate]   = useState('');
  const [isUSVacc,     setIsUSVacc]     = useState(false);
  const [tripName,     setTripName]     = useState('');
  const [error,        setError]        = useState('');

  const selectedPet    = pets.find((p: Pet) => p.id === petId);
  const selectedOrigin = COUNTRIES.find(c => c.code === originCode);

  // ── Trip limit: identical to original — trips.length < FREE_TRIP_LIMIT ───
  const canAddTrip = trips.length === 0;

  // ── Origin search filter (matches original filteredCountries) ────────────
  const filteredCountries = useMemo(() =>
    COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(searchOrigin.toLowerCase()) ||
      c.code.toLowerCase().includes(searchOrigin.toLowerCase())
    ), [searchOrigin]);

  // ── Risk badge colours ────────────────────────────────────────────────────
  function riskBadge(risk: string) {
    if (risk === 'rabies_free') return { label: 'Rabies-free', color: Colors.green };
    if (risk === 'low_risk')    return { label: 'Low risk',    color: Colors.yellow };
    return                             { label: 'High risk',   color: Colors.red    };
  }

  // ── Tomorrow as minimum travel date (original: tDate > new Date()) ────────
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const canCreate = destination && originCode && travelDate && petId;

  function handleCreate() {
    if (!petId)        { setError('Please select a pet');            return; }
    if (!destination)  { setError('Please select a destination');    return; }
    if (!originCode)   { setError('Please select origin country');   return; }
    if (!travelDate)   { setError('Please select a travel date');    return; }

    // Must be future date (original: tDate <= new Date() → reject)
    if (new Date(travelDate) <= new Date()) {
      setError('Travel date must be in the future');
      return;
    }

    if (!canAddTrip) {
      setError('Free plan allows 1 trip. Unlock your existing trip to continue.');
      return;
    }

    const scenario = buildTravelScenario({
      destination,
      originCountryCode: originCode,
      petType: selectedPet?.species ?? 'dog',
      isUSVaccinated: destination === 'US' ? isUSVacc : undefined,
    });

    const trip: Trip = {
      id:              uuid(),
      petId,
      petIds:          [petId],
      originCountryCode: originCode,
      destination,
      travelDate:      new Date(travelDate).toISOString(),
      isUSVaccinated:  destination === 'US' ? isUSVacc : undefined,
      scenario,
      checklist:       scenario.checklist,
      checklistState:  {},
      createdAt:       new Date().toISOString(),
      isPremium:       false,
      tripName:        tripName.trim() || undefined,
    };
    addTrip(trip);
    navigate(`/trips/${trip.id}`);
  }

  return (
    <div>
      <TravelBanner />

      {!canAddTrip && (
        <div style={{ background: Colors.orangeBg, color: Colors.orange, padding: '12px 16px', borderRadius: 12, marginBottom: 14, fontSize: 14, fontWeight: 600 }}>
          🔒 Free plan: 1 trip allowed. Unlock your existing trip's checklist to access all items.
        </div>
      )}

      {pets.length === 0 && (
        <div style={{ background: Colors.yellowBg, color: '#92680a', padding: 14, borderRadius: 12, marginBottom: 14, fontSize: 14 }}>
          ⚠️ Add a pet first.{' '}
          <button onClick={() => navigate('/pets/add')} style={{ color: '#1a52a0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            Add pet →
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: Colors.redBg, color: Colors.red, padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 18, padding: 20, boxShadow: `0 2px 10px ${Colors.shadow}` }}>

        {/* Trip name */}
        <FF label="Trip Name (optional)" value={tripName} onChange={setTripName}
          placeholder="e.g. Summer Holiday 2025" accent="#3B5BDB" />

        {/* Pet selector */}
        {pets.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <FL>Select Pet *</FL>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pets.map((p: Pet) => (
                <button key={p.id} onClick={() => setPetId(p.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 20,
                  border: `2px solid ${petId === p.id ? '#3B5BDB' : Colors.border}`,
                  background: petId === p.id ? TRAVEL_COLOR : Colors.navyLight,
                  color: petId === p.id ? '#1e3a8a' : Colors.cream,
                  fontWeight: petId === p.id ? 700 : 400, cursor: 'pointer', fontSize: 14,
                }}>
                  <span>{p.avatarEmoji ?? (p.species === 'cat' ? '🐱' : '🐶')}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Destination — user must tap to select, no default */}
        <div style={{ marginBottom: 18 }}>
          <FL>Destination *</FL>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {DESTINATIONS.map(d => (
              <button key={d.code} onClick={() => setDestination(d.code)} style={{
                padding: '12px 6px', borderRadius: 14, textAlign: 'center',
                border: `2px solid ${destination === d.code ? '#3B5BDB' : Colors.border}`,
                background: destination === d.code ? TRAVEL_COLOR : Colors.navyLight,
                cursor: 'pointer', transition: 'all .15s',
              }}>
                <div style={{ fontSize: 24 }}>{d.flag}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: destination === d.code ? '#1e3a8a' : Colors.cream, marginTop: 4 }}>{d.code}</div>
                <div style={{ fontSize: 10, color: Colors.creammid, marginTop: 2 }}>{d.desc}</div>
              </button>
            ))}
          </div>
          {!destination && (
            <p style={{ fontSize: 12, color: Colors.creammid, marginTop: 6 }}>👆 Tap to select your destination</p>
          )}
        </div>

        {/* US vaccinated toggle */}
        {destination === 'US' && selectedPet?.species === 'dog' && selectedOrigin?.region === 'high_risk' && (
          <div style={{ marginBottom: 18, padding: '12px 14px', background: Colors.blueBg, borderRadius: 12 }}>
            <FL>Was this dog vaccinated in the US?</FL>
            <div style={{ display: 'flex', gap: 10 }}>
              {([true, false] as const).map(val => (
                <button key={String(val)} onClick={() => setIsUSVacc(val)} style={{
                  flex: 1, padding: '8px', borderRadius: 10,
                  border: `2px solid ${isUSVacc === val ? Colors.blue : Colors.border}`,
                  background: isUSVacc === val ? Colors.blueBg : Colors.navyLight,
                  color: isUSVacc === val ? Colors.blue : Colors.cream,
                  fontWeight: 600, cursor: 'pointer', fontSize: 13,
                }}>{val ? '✅ Yes' : '❌ No / Unknown'}</button>
              ))}
            </div>
          </div>
        )}

        {/* Origin country — searchable, no default */}
        <div style={{ marginBottom: 18 }}>
          <FL>Travelling From *</FL>

          {/* Selected origin display */}
          {originCode && selectedOrigin && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10, marginBottom: 8,
              background: TRAVEL_COLOR, border: `2px solid #3B5BDB`,
            }}>
              <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{selectedOrigin.name}</span>
              {(() => { const rb = riskBadge(selectedOrigin.region); return (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${rb.color}22`, color: rb.color, fontWeight: 600 }}>
                  {rb.label}
                </span>
              ); })()}
              <button onClick={() => { setOriginCode(''); setSearchOrigin(''); }} style={{
                marginLeft: 'auto', color: Colors.creammid, background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 13,
              }}>✕ Change</button>
            </div>
          )}

          {/* Search box */}
          {!originCode && (
            <>
              <input
                value={searchOrigin}
                onChange={e => setSearchOrigin(e.target.value)}
                placeholder="Search country…"
                style={{
                  width: '100%', padding: '10px 13px', borderRadius: 10,
                  border: `1px solid ${Colors.border}`, background: Colors.navyLight,
                  fontSize: 14, color: Colors.cream, marginBottom: 8,
                }}
                onFocus={e => (e.target.style.borderColor = '#3B5BDB')}
                onBlur={e  => (e.target.style.borderColor = Colors.border)}
              />
              <div style={{ maxHeight: 180, overflowY: 'auto', borderRadius: 10, border: `1px solid ${Colors.border}` }}>
                {filteredCountries.slice(0, 8).map(c => {
                  const rb = riskBadge(c.region);
                  return (
                    <button key={c.code} onClick={() => { setOriginCode(c.code); setSearchOrigin(''); }} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: Colors.navyMid,
                      border: 'none', borderBottom: `1px solid ${Colors.borderLight}`,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = Colors.navyLight)}
                    onMouseLeave={e => (e.currentTarget.style.background = Colors.navyMid)}>
                      <span style={{ flex: 1, fontSize: 14, color: Colors.cream }}>{c.name}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${rb.color}22`, color: rb.color, fontWeight: 600 }}>
                        {rb.label}
                      </span>
                    </button>
                  );
                })}
                {filteredCountries.length === 0 && (
                  <div style={{ padding: '12px 14px', color: Colors.creammid, fontSize: 13 }}>No countries found</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Travel date — minimum tomorrow */}
        <FF label="Travel Date *" value={travelDate} onChange={setTravelDate}
          type="date" min={tomorrow} accent="#3B5BDB" />

        <button
          onClick={handleCreate}
          disabled={!canCreate || pets.length === 0}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, marginTop: 8,
            background: (!canCreate || pets.length === 0)
              ? Colors.border
              : 'linear-gradient(135deg, #1e3a8a 0%, #3B5BDB 100%)',
            color: '#fff', border: 'none', fontWeight: 700, fontSize: 16,
            cursor: (!canCreate || pets.length === 0) ? 'not-allowed' : 'pointer',
            boxShadow: canCreate ? '0 4px 16px rgba(30,58,138,0.35)' : 'none',
            opacity: (!canCreate || pets.length === 0) ? 0.6 : 1,
          }}
        >
          Generate Checklist ✈️
        </button>
      </div>

      <div style={{ marginTop: 14, padding: '12px 14px', background: TRAVEL_COLOR, borderRadius: 12, fontSize: 13, color: '#1e3a8a', border: '1px solid rgba(30,58,138,0.1)' }}>
        🔒 Free plan: 1 trip · Microchip item always unlocked · Unlock full checklist per trip
      </div>
    </div>
  );
}

function FL({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: Colors.creammid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</label>;
}
function FF({ label, value, onChange, placeholder, type = 'text', accent, min }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; accent: string; min?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <FL>{label}</FL>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} type={type} min={min}
        style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }}
        onFocus={e => (e.target.style.borderColor = accent)}
        onBlur={e  => (e.target.style.borderColor = Colors.border)}
      />
    </div>
  );
}
