import React, { useState } from 'react';
import { Colors } from '../utils/theme';
import { searchNearbyPlaces, geocodePostcode, type OsmPlace } from '../utils/overpassClient';

const BG = '#E8F4F0';

const FILTERS = [
  { label: '🏨 Hotels',  term: 'hotel'             },
  { label: '🏡 B&B',     term: 'bed and breakfast'  },
  { label: '⛺ Camping', term: 'campsite camping'    },
  { label: '🏠 Rentals', term: 'holiday apartment'   },
];

export function PlaceCard({ place, rank, accent }: { place: OsmPlace; rank: number; accent: string }) {
  const medals  = ['🥇','🥈','🥉'];
  const googleUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.address)}`;
  return (
    <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 14, borderLeft: `4px solid ${accent}`, boxShadow: `0 2px 8px ${Colors.shadow}`, marginBottom: 10 }}>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{medals[rank-1]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream, marginBottom: 2 }}>{place.name}</div>
            <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 6, lineHeight: 1.4 }}>📍 {place.address}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {place.distKm < 99 && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${accent}22`, color: accent, fontWeight: 600 }}>
                  📏 {place.distKm < 1 ? `${Math.round(place.distKm*1000)}m` : `${place.distKm.toFixed(1)}km`}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', textDecoration: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 700 }}>🗺️ View on Map</a>
          {place.website && (
            <a href={place.website.startsWith('http') ? place.website : `https://${place.website}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', textDecoration: 'none', background: Colors.navyLight, color: Colors.cream, border: `1px solid ${Colors.border}`, fontSize: 12, fontWeight: 700 }}>🌐 Website</a>
          )}
          {place.phone && (
            <a href={`tel:${place.phone}`} style={{ flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', textDecoration: 'none', background: Colors.navyLight, color: Colors.cream, border: `1px solid ${Colors.border}`, fontSize: 12, fontWeight: 700 }}>📞 Call</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaysPage() {
  const [mode,      setMode]      = useState<'location'|'postcode'>('location');
  const [postcode,  setPostcode]  = useState('');
  const [filterIdx, setFilterIdx] = useState(0);
  const [coords,    setCoords]    = useState<{lat:number;lon:number}|null>(null);
  const [label,     setLabel]     = useState('');
  const [places,    setPlaces]    = useState<OsmPlace[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [mapReady,  setMapReady]  = useState(false);

  async function search(lat: number, lon: number, lbl: string, fi = filterIdx) {
    setCoords({lat, lon}); setLabel(lbl); setMapReady(true);
    setPlacesLoading(true); setPlaces([]); setError('');
    try {
      const term   = FILTERS[fi].term + ' pet friendly';
      const places = await searchNearbyPlaces(lat, lon, term, `stays:${fi}:${lat.toFixed(3)},${lon.toFixed(3)}`);
      setPlaces(places);
      if (places.length === 0) setError('No results found nearby. The map below may show more options.');
    } catch {
      setError('Search failed. Please try again or use the map below.');
    } finally { setPlacesLoading(false); }
  }

  function handleUseLocation() {
    setLoading(true); setError(''); setMapReady(false);
    navigator.geolocation.getCurrentPosition(
      pos => { setLoading(false); search(pos.coords.latitude, pos.coords.longitude, 'your location'); },
      ()  => { setLoading(false); setError('Location denied. Enter a postcode instead.'); setMode('postcode'); },
      { timeout: 10_000 }
    );
  }

  async function handlePostcode() {
    if (!postcode.trim()) return;
    setLoading(true); setError(''); setMapReady(false);
    const result = await geocodePostcode(postcode.trim());
    setLoading(false);
    if (!result) { setError('Postcode not found. Try a city name (e.g. "London" or "New York").'); return; }
    search(result.lat, result.lon, result.displayName);
  }

  // Use coordinates in map URL for accuracy — not raw postcode text
  // Use coordinates as the search anchor so the map always shows the correct location
  const mapUrl = coords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(FILTERS[filterIdx].term + ' pet friendly near ' + coords.lat + ',' + coords.lon)}&ll=${coords.lat},${coords.lon}&z=13&output=embed`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>
      <div style={{ backgroundColor: BG, borderRadius: '0 0 24px 24px', marginLeft: -16, marginRight: -16, padding: '20px 20px 18px', marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#1a3530', marginBottom: 4 }}>🏨 Pet-Friendly Stays</h1>
        <p style={{ fontSize: 13, color: '#4a7a70', margin: 0 }}>Hotels, B&Bs and campgrounds that welcome pets</p>
      </div>

      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['location','postcode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: `2px solid ${mode===m?'#2A9D8F':Colors.border}`, background: mode===m?'rgba(42,157,143,0.12)':Colors.navyLight, color: mode===m?'#2A9D8F':Colors.creammid }}>
              {m === 'location' ? '📍 My Location' : '🔢 Postcode / City'}
            </button>
          ))}
        </div>

        {mode === 'location'
          ? <button onClick={handleUseLocation} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: loading ? Colors.border : 'linear-gradient(135deg,#2A9D8F,#1d7a6e)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '📡 Locating…' : '📍 Use My Current Location'}
            </button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <input value={postcode} onChange={e => setPostcode(e.target.value)} onKeyDown={e => e.key==='Enter' && handlePostcode()} placeholder="e.g. SW1A 1AA, London, New York" style={{ flex: 1, padding: '11px 13px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }}
                onFocus={e=>(e.target.style.borderColor='#2A9D8F')} onBlur={e=>(e.target.style.borderColor=Colors.border)} />
              <button onClick={handlePostcode} disabled={loading} style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: '#2A9D8F', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{loading ? '…' : 'Search'}</button>
            </div>
        }

        {error && <div style={{ marginTop: 10, padding: '8px 12px', background: Colors.redBg, color: Colors.red, borderRadius: 8, fontSize: 13 }}>⚠️ {error}</div>}

        {mapReady && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {FILTERS.map((f, i) => (
              <button key={i} onClick={() => { setFilterIdx(i); if (coords) search(coords.lat, coords.lon, label, i); }} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${filterIdx===i?'#2A9D8F':Colors.border}`, background: filterIdx===i?'rgba(42,157,143,0.12)':Colors.navyLight, color: filterIdx===i?'#2A9D8F':Colors.creammid, fontWeight: filterIdx===i?700:400 }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Top 3 */}
      {(placesLoading || places.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: Colors.cream, marginBottom: 10 }}>📍 Nearest {FILTERS[filterIdx].label} near {label}</h2>
          {placesLoading && [0,1,2].map(i => <div key={i} style={{ height: 90, borderRadius: 14, background: Colors.navyMid, border: `1px solid ${Colors.border}`, marginBottom: 10, opacity: 0.5 }} />)}
          {!placesLoading && places.map((p, i) => <PlaceCard key={p.id} place={p} rank={i+1} accent="#2A9D8F" />)}
        </div>
      )}

      {!mapReady && !loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: Colors.navyMid, borderRadius: 16, border: `2px dashed ${Colors.border}`, minHeight: 260 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Find Pet-Friendly Stays</h3>
          <p style={{ color: Colors.creammid, fontSize: 13, lineHeight: 1.6 }}>Use your location or enter a postcode/city to find nearby pet-friendly accommodation.</p>
        </div>
      )}

      {mapReady && mapUrl && (
        <>
          <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 8 }}>
            Showing: <strong style={{ color: Colors.cream }}>{FILTERS[filterIdx].label}</strong> near <strong style={{ color: Colors.cream }}>{label}</strong>
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
