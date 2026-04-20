import React, { useState } from 'react';
import { Colors } from '../utils/theme';
import { StaysBanner } from '../components/Illustrations';
import { geocodePostcode } from '../utils/overpassClient';

const FILTERS = [
  { label: '🏨 Hotels',  term: 'pet friendly hotels'         },
  { label: '🏡 B&B',     term: 'pet friendly bed and breakfast' },
  { label: '⛺ Camping', term: 'pet friendly camping'          },
  { label: '🏠 Rentals', term: 'pet friendly holiday rentals'  },
];

export function PlaceCard({ name, address, distKm, googleUrl, website, phone, rank, accent }:
  { name:string; address:string; distKm?:number; googleUrl:string; website?:string; phone?:string; rank:number; accent:string }) {
  const medals = ['🥇','🥈','🥉'];
  return (
    <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 14, borderLeft: `4px solid ${accent}`, marginBottom: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{medals[rank-1]}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream, marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 6 }}>📍 {address}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {distKm !== undefined && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${accent}22`, color: accent, fontWeight: 600 }}>📏 {distKm < 1 ? `${Math.round(distKm*1000)}m` : `${distKm.toFixed(1)}km`}</span>}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background:'rgba(42,157,143,0.1)', color:'#2A9D8F', fontWeight:600 }}>🐾 Pet-friendly</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:'8px', borderRadius:10, textAlign:'center', textDecoration:'none', background:accent, color:'#fff', fontSize:12, fontWeight:700 }}>🗺️ View on Map</a>
        {website && <a href={website.startsWith('http')?website:`https://${website}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:'8px', borderRadius:10, textAlign:'center', textDecoration:'none', background:Colors.navyLight, color:Colors.cream, border:`1px solid ${Colors.border}`, fontSize:12, fontWeight:700 }}>🌐 Website</a>}
        {phone && <a href={`tel:${phone}`} style={{ flex:1, padding:'8px', borderRadius:10, textAlign:'center', textDecoration:'none', background:Colors.navyLight, color:Colors.cream, border:`1px solid ${Colors.border}`, fontSize:12, fontWeight:700 }}>📞 Call</a>}
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
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [mapReady,  setMapReady]  = useState(false);

  function activate(lat: number, lon: number, lbl: string) {
    setCoords({lat,lon}); setLabel(lbl); setMapReady(true); setError('');
  }

  function handleUseLocation() {
    setLoading(true); setError(''); setMapReady(false);
    navigator.geolocation.getCurrentPosition(
      pos => { setLoading(false); activate(pos.coords.latitude, pos.coords.longitude, 'your location'); },
      ()  => { setLoading(false); setError('Location denied. Enter a postcode instead.'); setMode('postcode'); },
      { timeout: 10_000 }
    );
  }

  async function handlePostcode() {
    if (!postcode.trim()) return;
    setLoading(true); setError(''); setMapReady(false);
    const result = await geocodePostcode(postcode.trim());
    setLoading(false);
    if (!result) { setError('Postcode not found. Try adding a country, e.g. "75234, USA" or "SW1A 1AA, UK".'); return; }
    activate(result.lat, result.lon, result.displayName);
  }

  const term   = FILTERS[filterIdx].term;
  const mapUrl = coords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(term + ' near ' + coords.lat + ',' + coords.lon)}&ll=${coords.lat},${coords.lon}&z=13&output=embed`
    : null;
  const googleSearchUrl = coords
    ? `https://www.google.com/search?q=${encodeURIComponent(term + ' near ' + label)}`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>
      <StaysBanner />

      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['location','postcode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'8px', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer', border:`2px solid ${mode===m?'#2A9D8F':Colors.border}`, background:mode===m?'rgba(42,157,143,0.12)':Colors.navyLight, color:mode===m?'#2A9D8F':Colors.creammid }}>
              {m === 'location' ? '📍 My Location' : '🔢 Postcode / City'}
            </button>
          ))}
        </div>
        {mode === 'location'
          ? <button onClick={handleUseLocation} disabled={loading} style={{ width:'100%', padding:'12px', borderRadius:12, border:'none', background:loading?Colors.border:'linear-gradient(135deg,#2A9D8F,#1d7a6e)', color:'#fff', fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? '📡 Locating…' : '📍 Use My Current Location'}
            </button>
          : <div style={{ display:'flex', gap:8 }}>
              <input value={postcode} onChange={e=>setPostcode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePostcode()} placeholder='e.g. "75234, USA" or "London, UK"' style={{ flex:1, padding:'11px 13px', borderRadius:10, border:`1px solid ${Colors.border}`, background:Colors.navyLight, fontSize:14, color:Colors.cream }} onFocus={e=>(e.target.style.borderColor='#2A9D8F')} onBlur={e=>(e.target.style.borderColor=Colors.border)} />
              <button onClick={handlePostcode} disabled={loading} style={{ padding:'11px 16px', borderRadius:10, border:'none', background:'#2A9D8F', color:'#fff', fontWeight:700, cursor:'pointer' }}>{loading?'…':'Search'}</button>
            </div>
        }
        {error && <div style={{ marginTop:10, padding:'8px 12px', background:Colors.redBg, color:Colors.red, borderRadius:8, fontSize:13 }}>⚠️ {error}</div>}
        {mapReady && (
          <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
            {FILTERS.map((f,i) => (
              <button key={i} onClick={() => setFilterIdx(i)} style={{ padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', border:`1.5px solid ${filterIdx===i?'#2A9D8F':Colors.border}`, background:filterIdx===i?'rgba(42,157,143,0.12)':Colors.navyLight, color:filterIdx===i?'#2A9D8F':Colors.creammid, fontWeight:filterIdx===i?700:400 }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Google Search button — links to real Google results */}
      {mapReady && googleSearchUrl && (
        <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'14px', borderRadius:14, marginBottom:14, background:'linear-gradient(135deg,#2A9D8F,#1d7a6e)', textDecoration:'none', boxShadow:`0 3px 12px rgba(42,157,143,0.3)` }}>
          <span style={{ fontSize:20 }}>🔍</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#fff' }}>Search {FILTERS[filterIdx].label} on Google</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.8)' }}>Opens Google with full listings, ratings & reviews near {label}</div>
          </div>
          <span style={{ fontSize:16, color:'rgba(255,255,255,0.8)', marginLeft:'auto' }}>↗</span>
        </a>
      )}

      {!mapReady && !loading && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center', background:Colors.navyMid, borderRadius:16, border:`2px dashed ${Colors.border}`, minHeight:260 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🗺️</div>
          <h3 style={{ fontSize:17, fontWeight:600, marginBottom:8 }}>Find Pet-Friendly Stays</h3>
          <p style={{ color:Colors.creammid, fontSize:13, lineHeight:1.6 }}>Use your location or enter a postcode/city to find nearby accommodation.</p>
        </div>
      )}

      {mapReady && mapUrl && (
        <>
          <div style={{ fontSize:12, color:Colors.creammid, marginBottom:8 }}>
            Showing: <strong style={{ color:Colors.cream }}>{FILTERS[filterIdx].label}</strong> near <strong style={{ color:Colors.cream }}>{label}</strong>
          </div>
          <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${Colors.border}`, minHeight:400 }}>
            <iframe src={mapUrl} width="100%" height="400" style={{ border:'none', display:'block' }} allowFullScreen loading="lazy" title="Stays map" />
          </div>
          <div style={{ marginTop:10, padding:'10px 14px', background:Colors.navyMid, borderRadius:10, fontSize:12, color:Colors.creammid, border:`1px solid ${Colors.border}` }}>
            💡 Tap any pin for details, reviews and booking links. Use the Google Search button above for full listings.
          </div>
        </>
      )}
    </div>
  );
}
