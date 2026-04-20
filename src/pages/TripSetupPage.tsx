import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import { COUNTRIES, buildTravelScenario, type DestinationCountry } from '../data/travelRequirements';
import type { Trip, Pet } from '../store/appStore';
import { v4 as uuid } from 'uuid';
import { TravelBanner, TRAVEL_COLOR } from '../components/Illustrations';

const DESTINATIONS: { code: DestinationCountry; flag: string; label: string; desc: string; countryCodes: string[] }[] = [
  { code: 'US', flag: '🇺🇸', label: 'United States', desc: 'CDC rules (Aug 2024)',   countryCodes: ['US'] },
  { code: 'CA', flag: '🇨🇦', label: 'Canada',         desc: 'CFIA requirements',     countryCodes: ['CA'] },
  { code: 'EU', flag: '🇪🇺', label: 'European Union', desc: 'EC pet travel rules',    countryCodes: ['DE','FR','IT','ES','NL','BE','AT','CH','SE','NO','DK','FI','IE','PT'] },
  { code: 'AU', flag: '🇦🇺', label: 'Australia',      desc: 'DAFF / BICON (strict)', countryCodes: ['AU'] },
  { code: 'NZ', flag: '🇳🇿', label: 'New Zealand',    desc: 'MPI import rules',      countryCodes: ['NZ'] },
  { code: 'JP', flag: '🇯🇵', label: 'Japan',           desc: 'MAFF rules (strict)',   countryCodes: ['JP'] },
];

const ALL_COUNTRIES = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

function riskBadge(risk: string) {
  if (risk === 'rabies_free') return { label: 'Rabies-free', color: Colors.green };
  if (risk === 'low_risk')    return { label: 'Low risk',    color: Colors.yellow };
  return                             { label: 'High risk',   color: Colors.red };
}

// ── Searchable origin combobox ─────────────────────────────────────────────
function CountrySearchDropdown({
  value, onChange,
}: { value: string; onChange: (code: string) => void }) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [focused,  setFocused]  = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = ALL_COUNTRIES.find(c => c.code === value);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  function select(code: string) {
    onChange(code);
    setQuery('');
    setOpen(false);
    setFocused(false);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div
        onClick={() => { setOpen(o => !o); setFocused(true); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 13px', borderRadius: 10, cursor: 'pointer',
          border: `1px solid ${focused ? '#3B5BDB' : Colors.border}`,
          background: Colors.navyLight, minHeight: 44,
        }}
      >
        {selected
          ? <><span style={{ flex: 1, fontSize: 14, color: Colors.cream }}>{selected.name}</span><span style={{ color: Colors.creammid }}>▾</span></>
          : <span style={{ flex: 1, fontSize: 14, color: Colors.creammid }}>Select your origin country…</span>
        }
        <span style={{ color: Colors.creammid }}>▾</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300,
          background: Colors.navyMid, border: `1px solid ${Colors.border}`,
          borderRadius: 12, marginTop: 4, boxShadow: `0 8px 24px ${Colors.shadow}`,
          maxHeight: 280, display: 'flex', flexDirection: 'column',
        }}>
          {/* Search input inside dropdown */}
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${Colors.border}` }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to search country…"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                border: `1px solid ${Colors.border}`, background: Colors.navyLight,
                fontSize: 14, color: Colors.cream, outline: 'none',
              }}
            />
          </div>
          {/* Results list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: '12px 14px', color: Colors.creammid, fontSize: 13 }}>No countries found</div>
            )}
            {filtered.map(c => {
              const rb = riskBadge(c.region);
              return (
                <div
                  key={c.code}
                  onClick={() => select(c.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', cursor: 'pointer',
                    background: value === c.code ? 'rgba(59,91,219,0.12)' : 'transparent',
                    borderBottom: `1px solid ${Colors.borderLight}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = Colors.navyLight)}
                  onMouseLeave={e => (e.currentTarget.style.background = value === c.code ? 'rgba(59,91,219,0.12)' : 'transparent')}
                >
                  <span style={{ flex: 1, fontSize: 14, color: Colors.cream }}>{c.name}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: `${rb.color}22`, color: rb.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {rb.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function TripSetupPage() {
  const navigate = useNavigate();
  const { pets, trips, addTrip } = useData();

  const [petId,       setPetId]      = useState(pets.length === 1 ? pets[0].id : '');
  const [originCode,  setOriginCode] = useState('');
  const [destination, setDestination]= useState<DestinationCountry | null>(null);
  const [travelDate,  setTravelDate] = useState('');
  const [isUSVacc,    setIsUSVacc]   = useState(false);
  const [tripName,    setTripName]   = useState('');
  const [error,       setError]      = useState('');

  const selectedPet    = pets.find((p: Pet) => p.id === petId);
  const selectedOrigin = COUNTRIES.find(c => c.code === originCode);
  const canAddTrip     = trips.length === 0;

  const tomorrow = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  // Exclude destination if it contains the origin country code
  const availableDestinations = DESTINATIONS.filter(d =>
    !d.countryCodes.includes(originCode)
  );

  function handleOriginChange(code: string) {
    setOriginCode(code);
    // If chosen destination contains origin country, clear it
    if (destination) {
      const dest = DESTINATIONS.find(d => d.code === destination);
      if (dest?.countryCodes.includes(code)) setDestination(null);
    }
  }

  const canCreate = destination && originCode && travelDate && petId;

  function handleCreate() {
    if (!petId)        { setError('Please select a pet');            return; }
    if (!originCode)   { setError('Please select origin country');   return; }
    if (!destination)  { setError('Please select a destination');    return; }
    if (!travelDate)   { setError('Please select a travel date');    return; }
    if (new Date(travelDate) <= new Date()) {
      setError('Travel date must be in the future'); return;
    }
    if (!canAddTrip) {
      setError('Free plan allows 1 trip. Unlock your existing trip to continue.'); return;
    }

    const scenario = buildTravelScenario({
      destination,
      originCountryCode: originCode,
      petType:           selectedPet?.species ?? 'dog',
      isUSVaccinated:    destination === 'US' ? isUSVacc : undefined,
    });

    const trip: Trip = {
      id: uuid(), petId, petIds: [petId],
      originCountryCode: originCode, destination, travelDate: new Date(travelDate).toISOString(),
      isUSVaccinated: destination === 'US' ? isUSVacc : undefined,
      scenario, checklist: scenario.checklist, checklistState: {},
      createdAt: new Date().toISOString(), isPremium: false,
      tripName: tripName.trim() || undefined,
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
          <button onClick={() => navigate('/pets/add')} style={{ color: '#1a52a0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Add pet →</button>
        </div>
      )}

      {error && (
        <div style={{ background: Colors.redBg, color: Colors.red, padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 18, padding: 20, boxShadow: `0 2px 10px ${Colors.shadow}` }}>

        {/* Trip name */}
        <FieldLabel>Trip Name (optional)</FieldLabel>
        <input value={tripName} onChange={e => setTripName(e.target.value)} placeholder="e.g. Summer Holiday 2025"
          style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1px solid ${Colors.border}`, background:Colors.navyLight, fontSize:14, color:Colors.cream, marginBottom:16 }}
          onFocus={e=>(e.target.style.borderColor='#3B5BDB')} onBlur={e=>(e.target.style.borderColor=Colors.border)} />

        {/* Pet selector */}
        {pets.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <FieldLabel>Select Pet *</FieldLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pets.map((p: Pet) => (
                <button key={p.id} onClick={() => setPetId(p.id)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:20,
                  border:`2px solid ${petId === p.id ? '#3B5BDB' : Colors.border}`,
                  background: petId === p.id ? TRAVEL_COLOR : Colors.navyLight,
                  color: petId === p.id ? '#1e3a8a' : Colors.cream,
                  fontWeight: petId === p.id ? 700 : 400, cursor:'pointer', fontSize:14,
                }}>
                  <span>{p.avatarEmoji ?? (p.species==='cat'?'🐱':'🐶')}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Searchable origin combobox ─────────────────────────── */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Travelling From (Origin) *</FieldLabel>
          <CountrySearchDropdown value={originCode} onChange={handleOriginChange} />

          {selectedOrigin && (() => {
            const rb = riskBadge(selectedOrigin.region);
            return (
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:`${rb.color}22`, color:rb.color, fontWeight:600 }}>{rb.label}</span>
                <span style={{ fontSize:12, color:Colors.creammid }}>
                  {selectedOrigin.region === 'rabies_free' ? 'Simpler requirements for most destinations' :
                   selectedOrigin.region === 'high_risk'   ? 'More requirements — titer tests likely needed' :
                   'Standard requirements apply'}
                </span>
              </div>
            );
          })()}
        </div>

        {/* ── STEP 2: Destination button grid (shows after origin) ────────── */}
        {originCode ? (
          <div style={{ marginBottom: 18 }}>
            <FieldLabel>Destination * {destination && <span style={{ color: Colors.green, textTransform: 'none', fontWeight: 400 }}>— {DESTINATIONS.find(d=>d.code===destination)?.label} selected</span>}</FieldLabel>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10 }}>
              {availableDestinations.map(d => {
                const isSelected = destination === d.code;
                return (
                  <button key={d.code} onClick={() => setDestination(d.code)} style={{
                    padding:'14px 10px', borderRadius:14, textAlign:'center',
                    border:`2px solid ${isSelected ? '#3B5BDB' : Colors.border}`,
                    background: isSelected ? TRAVEL_COLOR : Colors.navyLight,
                    cursor:'pointer', transition:'all .15s',
                    boxShadow: isSelected ? '0 2px 10px rgba(59,91,219,0.2)' : 'none',
                  }}>
                    <div style={{ fontSize:28 }}>{d.flag}</div>
                    <div style={{ fontSize:13, fontWeight:700, color: isSelected ? '#1e3a8a' : Colors.cream, marginTop:4 }}>{d.label}</div>
                    <div style={{ fontSize:10, color: isSelected ? '#1e3a8a' : Colors.creammid, marginTop:2 }}>{d.desc}</div>
                  </button>
                );
              })}
            </div>
            {availableDestinations.length === 0 && (
              <p style={{ color:Colors.creammid, fontSize:13, marginTop:6 }}>No supported destinations outside your origin country.</p>
            )}
          </div>
        ) : (
          <div style={{ marginBottom:18, padding:'12px 14px', background:Colors.navyLight, borderRadius:12, border:`1px dashed ${Colors.border}`, textAlign:'center' }}>
            <p style={{ color:Colors.creammid, fontSize:13, margin:0 }}>👆 Select your origin country first to see available destinations</p>
          </div>
        )}

        {/* US vaccinated toggle */}
        {destination === 'US' && selectedPet?.species === 'dog' && selectedOrigin?.region === 'high_risk' && (
          <div style={{ marginBottom:18, padding:'12px 14px', background:Colors.blueBg, borderRadius:12 }}>
            <FieldLabel>Was this dog vaccinated against rabies in the US?</FieldLabel>
            <div style={{ display:'flex', gap:10 }}>
              {([true, false] as const).map(val => (
                <button key={String(val)} onClick={() => setIsUSVacc(val)} style={{
                  flex:1, padding:'8px', borderRadius:10,
                  border:`2px solid ${isUSVacc === val ? Colors.blue : Colors.border}`,
                  background: isUSVacc === val ? Colors.blueBg : Colors.navyLight,
                  color: isUSVacc === val ? Colors.blue : Colors.cream,
                  fontWeight:600, cursor:'pointer', fontSize:13,
                }}>{val ? '✅ Yes' : '❌ No / Unknown'}</button>
              ))}
            </div>
          </div>
        )}

        {/* Travel date */}
        <div style={{ marginBottom:16 }}>
          <FieldLabel>Travel Date *</FieldLabel>
          <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} min={tomorrow}
            style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1px solid ${Colors.border}`, background:Colors.navyLight, fontSize:14, color:Colors.cream }}
            onFocus={e=>(e.target.style.borderColor='#3B5BDB')} onBlur={e=>(e.target.style.borderColor=Colors.border)} />
        </div>

        {/* Long-lead warning for strict destinations */}
        {destination && ['AU','NZ','JP'].includes(destination) && (
          <div style={{ marginBottom:14, padding:'10px 14px', background:'rgba(239,68,68,0.08)', borderRadius:10, border:'1px solid rgba(239,68,68,0.2)', fontSize:12, color:'#fca5a5' }}>
            ⏳ <strong>{DESTINATIONS.find(d=>d.code===destination)?.label}</strong> requires 7–12 months preparation. Start the titer test process immediately after booking.
          </div>
        )}

        <button onClick={handleCreate} disabled={!canCreate || pets.length === 0}
          style={{
            width:'100%', padding:'14px', borderRadius:14, marginTop:8,
            background: (!canCreate || pets.length === 0) ? Colors.border : 'linear-gradient(135deg, #1e3a8a 0%, #3B5BDB 100%)',
            color:'#fff', border:'none', fontWeight:700, fontSize:16,
            cursor: (!canCreate || pets.length === 0) ? 'not-allowed' : 'pointer',
            boxShadow: canCreate ? '0 4px 16px rgba(30,58,138,0.35)' : 'none',
            opacity: (!canCreate || pets.length === 0) ? 0.6 : 1,
          }}>
          Generate Checklist ✈️
        </button>
      </div>

      <div style={{ marginTop:14, padding:'12px 14px', background:TRAVEL_COLOR, borderRadius:12, fontSize:13, color:'#1e3a8a', border:'1px solid rgba(30,58,138,0.1)' }}>
        🔒 Free plan: 1 trip · Microchip item always unlocked · Unlock full checklist per trip
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display:'block', fontSize:11, fontWeight:700, color:Colors.creammid, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
      {children}
    </label>
  );
}
