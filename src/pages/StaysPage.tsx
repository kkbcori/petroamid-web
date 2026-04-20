import React, { useState } from 'react';
import { Colors } from '../utils/theme';

const BG = '#E8F4F0';

interface Place {
  id:      number;
  name:    string;
  lat:     number;
  lon:     number;
  address: string;
  phone?:  string;
  website?:string;
  stars?:  string;
  distKm?: number;
}

// ── Overpass API query — no API key needed ────────────────────────────────────
async function fetchNearbyStays(lat: number, lon: number): Promise<Place[]> {
  const radius = 5000; // 5 km
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"hotel|guest_house|hostel|motel|apartment|camp_site"]["name"](around:${radius},${lat},${lon});
      way ["tourism"~"hotel|guest_house|hostel|motel|apartment|camp_site"]["name"](around:${radius},${lat},${lon});
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
      const t   = el.tags ?? {};
      const eLat = el.lat ?? el.center?.lat;
      const eLon = el.lon ?? el.center?.lon;
      const dist = eLat && eLon ? haversine(lat, lon, eLat, eLon) : 999;
      const addr = [t['addr:housenumber'], t['addr:street'], t['addr:city']]
        .filter(Boolean).join(' ') || t['addr:full'] || 'Address not listed';
      return {
        id: el.id, name: t.name || 'Unnamed', lat: eLat, lon: eLon,
        address: addr, phone: t.phone || t['contact:phone'],
        website: t.website || t['contact:website'],
        stars: t.stars, distKm: dist,
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
  const R = 6371, dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function rad(d: number) { return d * Math.PI / 180; }

type Mode = 'location' | 'postcode';

const FILTERS = [
  { label: '🏨 Hotels',  q: 'pet friendly hotels'     },
  { label: '🏡 B&B',     q: 'pet friendly bed breakfast' },
  { label: '⛺ Camping', q: 'pet friendly camping'     },
  { label: '🏠 Rentals', q: 'pet friendly holiday rental' },
];

export default function StaysPage() {
  const [mode,     setMode]     = useState<Mode>('location');
  const [postcode, setPostcode] = useState('');
  const [filter,   setFilter]   = useState(FILTERS[0].q);
  const [coords,   setCoords]   = useState<{ lat: number; lon: number } | null>(null);
  const [places,   setPlaces]   = useState<Place[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [geoError, setGeoError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  async function search(lat: number, lon: number, label: string) {
    setCoords({ lat, lon });
    setLocationLabel(label);
    setMapReady(true);
    setPlacesLoading(true);
    setPlaces([]);
    try {
      const results = await fetchNearbyStays(lat, lon);
      setPlaces(results);
    } catch { setPlaces([]); }
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
    if (!c) { setGeoError('Postcode not found. Try a city name or different format.'); return; }
    search(c.lat, c.lon, postcode.trim());
  }

  const mapUrl = coords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(filter + ' ' + locationLabel)}&ll=${coords.lat},${coords.lon}&output=embed&z=13`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>

      {/* Banner */}
      <div style={{ backgroundColor: BG, borderRadius: '0 0 24px 24px', marginLeft: -16, marginRight: -16, padding: '20px 20px 18px', marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#1a3530', marginBottom: 4 }}>🏨 Pet-Friendly Stays</h1>
        <p style={{ fontSize: 13, color: '#4a7a70', margin: 0 }}>Hotels, B&Bs and campgrounds that welcome pets</p>
      </div>

      {/* Search card */}
      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['location', 'postcode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              border: `2px solid ${mode === m ? '#2A9D8F' : Colors.border}`,
              background: mode === m ? 'rgba(42,157,143,0.12)' : Colors.navyLight,
              color: mode === m ? '#2A9D8F' : Colors.creammid,
            }}>{m === 'location' ? '📍 My Location' : '🔢 Postcode / City'}</button>
          ))}
        </div>

        {mode === 'location'
          ? <button onClick={handleUseLocation} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: loading ? Colors.border : 'linear-gradient(135deg,#2A9D8F,#1d7a6e)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '📡 Locating…' : '📍 Use My Current Location'}
            </button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <input value={postcode} onChange={e => setPostcode(e.target.value)} onKeyDown={e => e.key==='Enter' && handlePostcode()}
                placeholder="e.g. SW1A 1AA or New York"
                style={{ flex: 1, padding: '11px 13px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }}
                onFocus={e=>(e.target.style.borderColor='#2A9D8F')} onBlur={e=>(e.target.style.borderColor=Colors.border)} />
              <button onClick={handlePostcode} disabled={loading} style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: '#2A9D8F', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '…' : 'Search'}
              </button>
            </div>
        }

        {geoError && <div style={{ marginTop: 10, padding: '8px 12px', background: Colors.redBg, color: Colors.red, borderRadius: 8, fontSize: 13 }}>⚠️ {geoError}</div>}

        {/* Filter chips */}
        {mapReady && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.q} onClick={() => setFilter(f.q)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1.5px solid ${filter === f.q ? '#2A9D8F' : Colors.border}`,
                background: filter === f.q ? 'rgba(42,157,143,0.12)' : Colors.navyLight,
                color: filter === f.q ? '#2A9D8F' : Colors.creammid,
                fontWeight: filter === f.q ? 700 : 400,
              }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Top 3 nearby stays ── */}
      {(placesLoading || places.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: Colors.cream, marginBottom: 10 }}>
            📍 Nearest Stays {locationLabel ? `near ${locationLabel}` : ''}
          </h2>

          {placesLoading && (
            <div style={{ display: 'flex', gap: 10 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ flex: 1, height: 110, borderRadius: 14, background: Colors.navyMid, border: `1px solid ${Colors.border}`, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          )}

          {!placesLoading && places.length === 0 && (
            <div style={{ padding: '12px 16px', background: Colors.navyMid, borderRadius: 12, fontSize: 13, color: Colors.creammid }}>
              No stays found nearby in OpenStreetMap data. Try the map below for more results.
            </div>
          )}

          {!placesLoading && places.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {places.map((p, i) => (
                <PlaceCard key={p.id} place={p} rank={i + 1} accentColor="#2A9D8F" type="stay" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      {!mapReady && !loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: Colors.navyMid, borderRadius: 16, border: `2px dashed ${Colors.border}`, minHeight: 260 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Find Pet-Friendly Stays</h3>
          <p style={{ color: Colors.creammid, fontSize: 13, lineHeight: 1.6 }}>Use your location or enter a postcode to find nearby pet-friendly accommodation.</p>
        </div>
      )}

      {mapReady && mapUrl && (
        <>
          <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 8 }}>
            Showing: <strong style={{ color: Colors.cream }}>{FILTERS.find(f=>f.q===filter)?.label}</strong> near <strong style={{ color: Colors.cream }}>{locationLabel}</strong>
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${Colors.border}`, minHeight: 380 }}>
            <iframe src={mapUrl} width="100%" height="380" style={{ border: 'none', display: 'block' }} allowFullScreen loading="lazy" title="Stays map" />
          </div>
          <div style={{ marginTop: 10, padding: '10px 14px', background: Colors.navyMid, borderRadius: 10, fontSize: 12, color: Colors.creammid, border: `1px solid ${Colors.border}` }}>
            💡 Tap any pin on the map to see details, reviews and booking options.
          </div>
        </>
      )}
    </div>
  );
}

// ── Shared place card ─────────────────────────────────────────────────────────
function PlaceCard({ place, rank, accentColor, type }: { place: Place; rank: number; accentColor: string; type: 'stay' | 'vet' }) {
  const googleUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.address)}`;
  const medals = ['🥇','🥈','🥉'];

  return (
    <div style={{
      background: Colors.navyMid, border: `1px solid ${Colors.border}`,
      borderRadius: 14, overflow: 'hidden',
      borderLeft: `4px solid ${accentColor}`,
      boxShadow: `0 2px 8px ${Colors.shadow}`,
    }}>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{medals[rank - 1]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream, marginBottom: 2 }}>{place.name}</div>
            <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 6, lineHeight: 1.4 }}>
              📍 {place.address}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {place.distKm !== undefined && place.distKm < 99 && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${accentColor}22`, color: accentColor, fontWeight: 600 }}>
                  📏 {place.distKm < 1 ? `${Math.round(place.distKm * 1000)}m` : `${place.distKm.toFixed(1)}km away`}
                </span>
              )}
              {place.stars && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: Colors.goldLight, color: Colors.gold, fontWeight: 600 }}>
                  ⭐ {place.stars} stars
                </span>
              )}
              {type === 'stay' && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', fontWeight: 600 }}>
                  🐾 Pet friendly
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', textDecoration: 'none',
            background: accentColor, color: '#fff', fontSize: 12, fontWeight: 700,
          }}>🗺️ View on Map</a>
          {place.website && (
            <a href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
              target="_blank" rel="noopener noreferrer" style={{
                flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', textDecoration: 'none',
                background: Colors.navyLight, color: Colors.cream, border: `1px solid ${Colors.border}`, fontSize: 12, fontWeight: 700,
              }}>🌐 Website</a>
          )}
          {place.phone && (
            <a href={`tel:${place.phone}`} style={{
              flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', textDecoration: 'none',
              background: Colors.navyLight, color: Colors.cream, border: `1px solid ${Colors.border}`, fontSize: 12, fontWeight: 700,
            }}>📞 Call</a>
          )}
        </div>
      </div>
    </div>
  );
}

export { PlaceCard };
