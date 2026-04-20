// ─────────────────────────────────────────────────────────────────────────────
// StaysPage — Pet-friendly stays map
// Mobile-first: navigator.geolocation → identical to RN's Geolocation API
// Map: Google Maps embed (no API key) → RN uses react-native-maps or WebView
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Colors } from '../utils/theme';

const BANNER_COLOR = '#E8F4F0';

type SearchMode = 'location' | 'postcode';

export default function StaysPage() {
  const [mode,       setMode]       = useState<SearchMode>('location');
  const [postcode,   setPostcode]   = useState('');
  const [query,      setQuery]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [geoError,   setGeoError]   = useState('');
  const [mapReady,   setMapReady]   = useState(false);

  // Build Google Maps embed URL
  function buildMapUrl(searchQuery: string) {
    const q = encodeURIComponent(`pet friendly hotels near ${searchQuery}`);
    return `https://www.google.com/maps/embed/v1/search?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${q}`;
  }

  // Fallback: direct search URL (no API key needed — opens in iframe)
  function buildFallbackUrl(searchQuery: string) {
    const q = encodeURIComponent(`pet friendly hotels ${searchQuery}`);
    return `https://maps.google.com/maps?q=${q}&output=embed&z=13`;
  }

  function handleUseLocation() {
    setLoading(true);
    setGeoError('');
    setMapReady(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setQuery(`${latitude},${longitude}`);
        setMapReady(true);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setGeoError('Location access denied. Please enter a postcode instead.');
        setMode('postcode');
      },
      { timeout: 10_000 }
    );
  }

  function handlePostcodeSearch() {
    if (!postcode.trim()) return;
    setMapReady(false);
    setGeoError('');
    setTimeout(() => { setQuery(postcode.trim()); setMapReady(true); }, 100);
  }

  const FILTER_TYPES = [
    { label: '🏨 Hotels',    q: 'pet friendly hotels'    },
    { label: '🏡 Airbnb',    q: 'pet friendly airbnb'    },
    { label: '⛺ Camping',   q: 'pet friendly camping'   },
    { label: '🏠 Apartments', q: 'pet friendly apartments' },
  ];
  const [filterType, setFilterType] = useState(FILTER_TYPES[0].q);

  const mapUrl = mapReady
    ? buildFallbackUrl(`${filterType} ${query}`)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '85vh' }}>

      {/* Banner */}
      <div style={{
        backgroundColor: BANNER_COLOR,
        borderRadius: '0 0 24px 24px',
        marginLeft: -16, marginRight: -16,
        padding: '20px 20px 18px',
        marginBottom: 16,
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#1a3530', marginBottom: 4 }}>
          🏨 Pet-Friendly Stays
        </h1>
        <p style={{ fontSize: 13, color: '#4a7a70', margin: 0 }}>Find hotels, rentals & campgrounds that welcome pets</p>
      </div>

      {/* Search controls */}
      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['location', 'postcode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              border: `2px solid ${mode === m ? '#2A9D8F' : Colors.border}`,
              background: mode === m ? 'rgba(42,157,143,0.12)' : Colors.navyLight,
              color: mode === m ? '#2A9D8F' : Colors.creammid,
            }}>
              {m === 'location' ? '📍 My Location' : '🔢 Postcode'}
            </button>
          ))}
        </div>

        {mode === 'location' ? (
          <button onClick={handleUseLocation} disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
            background: loading ? Colors.border : 'linear-gradient(135deg, #2A9D8F, #1d7a6e)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? '📡 Getting location…' : '📍 Use My Current Location'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={postcode} onChange={e => setPostcode(e.target.value)}
              placeholder="Enter postcode or city (e.g. SW1A 1AA)"
              onKeyDown={e => e.key === 'Enter' && handlePostcodeSearch()}
              style={{ flex: 1, padding: '11px 13px', borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 14, color: Colors.cream }}
              onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
              onBlur={e  => (e.target.style.borderColor = Colors.border)}
            />
            <button onClick={handlePostcodeSearch} style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: '#2A9D8F', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Search
            </button>
          </div>
        )}

        {geoError && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: Colors.redBg, color: Colors.red, borderRadius: 8, fontSize: 13 }}>
            ⚠️ {geoError}
          </div>
        )}

        {/* Filter chips */}
        {mapReady && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {FILTER_TYPES.map(f => (
              <button key={f.q} onClick={() => { setFilterType(f.q); setMapReady(false); setTimeout(() => setMapReady(true), 100); }} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1.5px solid ${filterType === f.q ? '#2A9D8F' : Colors.border}`,
                background: filterType === f.q ? 'rgba(42,157,143,0.12)' : Colors.navyLight,
                color: filterType === f.q ? '#2A9D8F' : Colors.creammid, fontWeight: filterType === f.q ? 700 : 400,
              }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      {!mapReady && !loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: Colors.navyMid, borderRadius: 16, border: `2px dashed ${Colors.border}`, minHeight: 280 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Find Pet-Friendly Stays</h3>
          <p style={{ color: Colors.creammid, fontSize: 13, lineHeight: 1.6 }}>
            Use your location or enter a postcode to see pet-friendly hotels, Airbnbs, and campgrounds near you.
          </p>
        </div>
      )}

      {mapReady && mapUrl && (
        <>
          <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 8, paddingLeft: 2 }}>
            Showing: <strong style={{ color: Colors.cream }}>{FILTER_TYPES.find(f => f.q === filterType)?.label}</strong> near <strong style={{ color: Colors.cream }}>{postcode || 'your location'}</strong>
          </div>
          <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: `1px solid ${Colors.border}`, minHeight: 400, position: 'relative' }}>
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 'none', minHeight: 400, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pet-friendly stays map"
            />
          </div>
          <div style={{ marginTop: 10, padding: '10px 14px', background: Colors.navyMid, borderRadius: 10, fontSize: 12, color: Colors.creammid, border: `1px solid ${Colors.border}` }}>
            💡 Tap any pin on the map to see hotel details, reviews, and booking options. Results are from Google Maps.
          </div>
        </>
      )}
    </div>
  );
}
