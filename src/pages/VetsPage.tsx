import React, { useState } from 'react';
import { Colors } from '../utils/theme';
import { geocodePostcode } from '../utils/overpassClient';

const BG = '#EAF0F8';

const FILTERS = [
  { label: '🏥 Vet Clinics',     term: 'veterinary clinic'          },
  { label: '🚨 Emergency Vet',   term: 'emergency veterinary hospital' },
  { label: '💊 Pet Pharmacy',    term: 'pet pharmacy'                },
  { label: '🐾 Animal Hospital', term: 'animal hospital'             },
];

export default function VetsPage() {
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
    <div style={{ display:'flex', flexDirection:'column', minHeight:'85vh' }}>
      <div style={{ backgroundColor:BG, borderRadius:'0 0 24px 24px', marginLeft:-16, marginRight:-16, padding:'20px 20px 18px', marginBottom:16 }}>
        <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:22, fontWeight:700, color:'#1a2952', marginBottom:4 }}>🏥 Nearby Vets</h1>
        <p style={{ fontSize:13, color:'#4a6a8a', margin:0 }}>Find vet clinics, emergency hospitals and pet pharmacies near you</p>
      </div>

      <div style={{ padding:'10px 14px', background:'#FEF2F2', borderRadius:12, marginBottom:14, border:'1px solid #FECACA', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22 }}>🚨</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#991B1B' }}>Pet Emergency?</div>
          <div style={{ fontSize:12, color:'#B91C1C' }}>Switch to "Emergency Vet" and use the Google Search button for the nearest 24hr hospital</div>
        </div>
      </div>

      <div style={{ background:Colors.navyMid, border:`1px solid ${Colors.border}`, borderRadius:16, padding:16, marginBottom:14 }}>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {(['location','postcode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'8px', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer', border:`2px solid ${mode===m?'#3B5BDB':Colors.border}`, background:mode===m?'rgba(59,91,219,0.1)':Colors.navyLight, color:mode===m?'#3B5BDB':Colors.creammid }}>
              {m === 'location' ? '📍 My Location' : '🔢 Postcode / City'}
            </button>
          ))}
        </div>
        {mode === 'location'
          ? <button onClick={handleUseLocation} disabled={loading} style={{ width:'100%', padding:'12px', borderRadius:12, border:'none', background:loading?Colors.border:'linear-gradient(135deg,#3B5BDB,#1e3a8a)', color:'#fff', fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer' }}>
              {loading?'📡 Locating…':'📍 Use My Current Location'}
            </button>
          : <div style={{ display:'flex', gap:8 }}>
              <input value={postcode} onChange={e=>setPostcode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePostcode()} placeholder='e.g. "75234, USA" or "London, UK"' style={{ flex:1, padding:'11px 13px', borderRadius:10, border:`1px solid ${Colors.border}`, background:Colors.navyLight, fontSize:14, color:Colors.cream }} onFocus={e=>(e.target.style.borderColor='#3B5BDB')} onBlur={e=>(e.target.style.borderColor=Colors.border)} />
              <button onClick={handlePostcode} disabled={loading} style={{ padding:'11px 16px', borderRadius:10, border:'none', background:'#3B5BDB', color:'#fff', fontWeight:700, cursor:'pointer' }}>{loading?'…':'Search'}</button>
            </div>
        }
        {error && <div style={{ marginTop:10, padding:'8px 12px', background:Colors.redBg, color:Colors.red, borderRadius:8, fontSize:13 }}>⚠️ {error}</div>}
        {mapReady && (
          <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
            {FILTERS.map((f,i) => (
              <button key={i} onClick={() => setFilterIdx(i)} style={{ padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', border:`1.5px solid ${filterIdx===i?'#3B5BDB':Colors.border}`, background:filterIdx===i?'rgba(59,91,219,0.1)':Colors.navyLight, color:filterIdx===i?'#3B5BDB':Colors.creammid, fontWeight:filterIdx===i?700:400 }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Google Search button */}
      {mapReady && googleSearchUrl && (
        <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'14px', borderRadius:14, marginBottom:14, background:'linear-gradient(135deg,#3B5BDB,#1e3a8a)', textDecoration:'none', boxShadow:`0 3px 12px rgba(59,91,219,0.3)` }}>
          <span style={{ fontSize:20 }}>🔍</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#fff' }}>Search {FILTERS[filterIdx].label} on Google</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.8)' }}>Opens Google with full listings, ratings & phone numbers near {label}</div>
          </div>
          <span style={{ fontSize:16, color:'rgba(255,255,255,0.8)', marginLeft:'auto' }}>↗</span>
        </a>
      )}

      {!mapReady && !loading && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center', background:Colors.navyMid, borderRadius:16, border:`2px dashed ${Colors.border}`, minHeight:260 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🏥</div>
          <h3 style={{ fontSize:17, fontWeight:600, marginBottom:8 }}>Find Nearby Vets</h3>
          <p style={{ color:Colors.creammid, fontSize:13, lineHeight:1.6 }}>Use your location or enter a postcode/city to find vet clinics and animal hospitals near you.</p>
        </div>
      )}

      {mapReady && mapUrl && (
        <>
          <div style={{ fontSize:12, color:Colors.creammid, marginBottom:8 }}>
            Showing: <strong style={{ color:Colors.cream }}>{FILTERS[filterIdx].label}</strong> near <strong style={{ color:Colors.cream }}>{label}</strong>
          </div>
          <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${Colors.border}`, minHeight:400 }}>
            <iframe src={mapUrl} width="100%" height="400" style={{ border:'none', display:'block' }} allowFullScreen loading="lazy" title="Vets map" />
          </div>
          <div style={{ marginTop:10, padding:'10px 14px', background:Colors.navyMid, borderRadius:10, fontSize:12, color:Colors.creammid, border:`1px solid ${Colors.border}` }}>
            💡 Tap any pin for clinic details, opening hours and phone number. Use the Google Search button above for full listings.
          </div>
        </>
      )}
    </div>
  );
}
