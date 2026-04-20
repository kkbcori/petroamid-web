import React, { useState } from 'react';
import { Colors } from '../utils/theme';
import { PlaceCard } from './StaysPage';

const BG = '#EAF0F8';

interface Place {
  id: number; name: string; lat: number; lon: number;
  address: string; phone?: string; website?: string;
  opening_hours?: string; distKm?: number;
}

async function fetchNearbyVets(lat: number, lon: number, type: string): Promise<Place[]> {
  const amenityMap: Record<string, string> = {
    'vet':        '"amenity"="veterinary"',
    'emergency':  '"amenity"~"veterinary|animal_hospital"',
    'pharmacy':   '"shop"~"pet|veterinary"',
    'hospital':   '"amenity"="animal_hospital"',
  };
  const filter = amenityMap[type] ?? amenityMap['vet'];
  const query = `
    [out:json][timeout:25];
    (
      node[${filter}]["name"](around:8000,${lat},${lon});
      way [${filter}]["name"](around:8000,${lat},${lon});
    );
    out body center 20;
  `;
  const res  = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const data = await res.json();

  return (data.elements as any[])
    .map((el: any) => {
      const t    = el.tags ?? {};
      const eLat = el.lat ?? el.center?.lat;
      const eLon = el.lon ?? el.center?.lon;
      const dist = eLat && eLon ? haversine(lat, lon, eLat, eLon) : 999;
      const addr = [t['addr:housenumber'], t['addr:street'], t['addr:city']]
        .filter(Boolean).join(' ') || t['addr:full'] || 'Address not listed';
      return {
        id: el.id, name: t.name || 'Unnamed', lat: eLat, lon: eLon,
        address: addr, phone: t.phone || t['contact:phone'],
        website: t.website || t['contact:website'],
        opening_hours: t.opening_hours, distKm: dist,
      } as Place;
    })
    .filter(p => p.name !== 'Unnamed')
    .sort((a, b) => (a.distKm ?? 99) - (b.distKm ?? 99))
    .slice(0, 3);
}

async function geocodePostcode(postcode: string): Promise<{ lat: number; lon: number } | null> {
  const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode)}&format=json&limit=1`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'PetRoamID/1.0' }
  });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, dLat = rad(lat2-lat1), dLon = rad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function rad(d: number) { return d * Math.PI / 180; }

const FILTERS = [
  { label: '🏥 Vet Clinics',   key: 'vet'       },
  { label: '🚨 Emergency',     key: 'emergency'  },
  { label: '💊 Pet Pharmacy',  key: 'pharmacy'   },
  { label: '🐾 Animal Hospital', key: 'hospital' },
];

export default function VetsPage() {
  const [mode,     setMode]     = useState<'location'|'postcode'>('location');
  const [postcode, setPostcode] = useState('');
  const [filter,   setFilter]   = useState('vet');
  const [coords,   setCoords]   = useState<{lat:number;lon:number}|null>(null);
  const [places,   setPlaces]   = useState<Place[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [geoError, setGeoError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  async function search(lat: number, lon: number, label: string, type = filter) {
    setCoords({ lat, lon }); setLocationLabel(label);
    setMapReady(true); setPlacesLoading(true); setPlaces([]);
    try { setPlaces(await fetchNearbyVets(lat, lon, type)); }
    catch { setPlaces([]); }
    finally { setPlacesLoading(false); }
  }

  function handleUseLocation() {
    setLoading(true); setGeoError(''); setMapReady(false);
    navigator.geolocation.getCurrentPosition(
      pos => { setLoading(false); search(pos.coords.latitude, pos.coords.longitude, 'your location'); },
      ()  => { setLoading(false); setGeoError('Location denied. Enter a postcode instead.'); setMode('postcode'); },
      { timeout: 10_000 }
    );
  }

  async function handlePostcode() {
    if (!postcode.trim()) return;
    setLoading(true); setGeoError(''); setMapReady(false);
    const c = await geocodePostcode(postcode.trim());
    setLoading(false);
    if (!c) { setGeoError('Postcode not found. Try a city name.'); return; }
    search(c.lat, c.lon, postcode.trim());
  }

  function handleFilterChange(newFilter: string) {
    setFilter(newFilter);
    if (coords) search(coords.lat, coords.lon, locationLabel, newFilter);
  }

  const mapUrl = coords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(FILTERS.find(f=>f.key===filter)?.label.replace(/[^\w\s]/g,'') + ' ' + locationLabel)}&ll=${coords.lat},${coords.lon}&output=embed&z=13`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>

      {/* Banner */}
      <div style={{ backgroundColor: BG, borderRadius: '0 0 24px 24px', marginLeft: -16, marginRight: -16, padding: '20px 20px 18px', marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#1a2952', marginBottom: 4 }}>🏥 Nearby Vets</h1>
        <p style={{ fontSize: 13, color: '#4a6a8a', margin: 0 }}>Find vet clinics, emergency hospitals and pet pharmacies near you</p>
      </div>

      {/* Emergency strip */}
      <div style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: 12, marginBottom: 14, border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🚨</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B' }}>Pet Emergency?</div>
          <div style={{ fontSize: 12, color: '#B91C1C' }}>Switch to the "Emergency" filter and call the nearest 24hr hospital</div>
        </div>
      </div>

      {/* Search card */}
      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['location','postcode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              border: `2px solid ${mode === m ? '#3B5BDB' : Colors.border}`,
              background: mode === m ? 'rgba(59,91,219,0.1)' : Colors.navyLight,
              color: mode === m ? '#3B5BDB' : Colors.creammid,
            }}>{m === 'location' ? '📍 My Location' : '🔢 Postcode / City'}</button>
          ))}
        </div>

        {mode === 'location'
          ? <button onClick={handleUseLocation} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: loading ? Colors.border : 'linear-gradient(135deg,#3B5BDB,#1e3a8a)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '📡 Locating…' : '📍 Use My Current Location'}
            </button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <input value={postcode} onChange={e => setPostcode(e.target.value)} onKeyDown={e => e.key==='Enter' && handlePostcode()}
                placeholder="e.g. SW1A 1AA or New York"
                style={{ flex: 1, padding: '11px 13px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }}
                onFocus={e=>(e.target.style.borderColor='#3B5BDB')} onBlur={e=>(e.target.style.borderColor=Colors.border)} />
              <button onClick={handlePostcode} disabled={loading} style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: '#3B5BDB', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '…' : 'Search'}
              </button>
            </div>
        }

        {geoError && <div style={{ marginTop: 10, padding: '8px 12px', background: Colors.redBg, color: Colors.red, borderRadius: 8, fontSize: 13 }}>⚠️ {geoError}</div>}

        {/* Filter chips */}
        {mapReady && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => handleFilterChange(f.key)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1.5px solid ${filter === f.key ? '#3B5BDB' : Colors.border}`,
                background: filter === f.key ? 'rgba(59,91,219,0.1)' : Colors.navyLight,
                color: filter === f.key ? '#3B5BDB' : Colors.creammid,
                fontWeight: filter === f.key ? 700 : 400,
              }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Top 3 vets */}
      {(placesLoading || places.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: Colors.cream, marginBottom: 10 }}>
            📍 Nearest {FILTERS.find(f=>f.key===filter)?.label} {locationLabel ? `near ${locationLabel}` : ''}
          </h2>

          {placesLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ height: 100, borderRadius: 14, background: Colors.navyMid, border: `1px solid ${Colors.border}` }} />
              ))}
            </div>
          )}

          {!placesLoading && places.length === 0 && (
            <div style={{ padding: '12px 16px', background: Colors.navyMid, borderRadius: 12, fontSize: 13, color: Colors.creammid }}>
              No {FILTERS.find(f=>f.key===filter)?.label.toLowerCase()} found nearby. Try the map below or a wider search area.
            </div>
          )}

          {!placesLoading && places.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {places.map((p, i) => (
                <PlaceCard key={p.id} place={p} rank={i + 1} accentColor="#3B5BDB" type="vet" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!mapReady && !loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: Colors.navyMid, borderRadius: 16, border: `2px dashed ${Colors.border}`, minHeight: 260 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Find Nearby Vets</h3>
          <p style={{ color: Colors.creammid, fontSize: 13, lineHeight: 1.6 }}>Use your location or enter a postcode to see vet clinics and animal hospitals near you.</p>
        </div>
      )}

      {/* Map */}
      {mapReady && mapUrl && (
        <>
          <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 8 }}>
            Showing: <strong style={{ color: Colors.cream }}>{FILTERS.find(f=>f.key===filter)?.label}</strong> near <strong style={{ color: Colors.cream }}>{locationLabel}</strong>
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${Colors.border}`, minHeight: 360 }}>
            <iframe src={mapUrl} width="100%" height="360" style={{ border: 'none', display: 'block' }} allowFullScreen loading="lazy" title="Vets map" />
          </div>
          <div style={{ marginTop: 10, padding: '10px 14px', background: Colors.navyMid, borderRadius: 10, fontSize: 12, color: Colors.creammid, border: `1px solid ${Colors.border}` }}>
            💡 Tap any pin to see clinic details, opening hours, phone number and directions.
          </div>
        </>
      )}
    </div>
  );
}
