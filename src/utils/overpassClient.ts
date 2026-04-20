// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID — Places search via Nominatim (OSM)
// Free, no API key, reliable. 1 req/sec rate limit — fine for user searches.
// ─────────────────────────────────────────────────────────────────────────────

export interface OsmPlace {
  id:       number;
  name:     string;
  lat:      number;
  lon:      number;
  address:  string;
  phone?:   string;
  website?: string;
  distKm:   number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function cacheGet(key: string): any | null {
  try { const r = sessionStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function cacheSet(key: string, value: any) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// Map IANA timezones to ISO country codes for geocoding bias
function getCountryFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith('America/'))   return 'us';
    if (tz.startsWith('Europe/London') || tz === 'Europe/Belfast') return 'gb';
    if (tz.startsWith('Australia/')) return 'au';
    if (tz.startsWith('Pacific/Auckland') || tz === 'Pacific/Chatham') return 'nz';
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver') ||
        tz.startsWith('America/Winnipeg') || tz.startsWith('America/Halifax')) return 'ca';
    if (tz.startsWith('Asia/Kolkata') || tz === 'Asia/Calcutta') return 'in';
    if (tz.startsWith('Europe/')) return 'eu';   // generic EU bias
    if (tz.startsWith('Asia/Singapore')) return 'sg';
    if (tz.startsWith('Asia/Dubai'))    return 'ae';
  } catch { /* ignore */ }
  return '';
}

export async function geocodePostcode(
  postcode: string
): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const key = `geo:${postcode.toLowerCase().trim()}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  try {
    const country = getCountryFromTimezone();
    // countrycodes biases results to the user's country — prevents US ZIP resolving to Ukraine
    const countryParam = country ? `&countrycodes=${country}` : '';
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode)}&format=json&limit=1&addressdetails=0${countryParam}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'PetRoamID/1.0' }, signal: AbortSignal.timeout(8_000) }
    );
    const data = await res.json();
    if (!data.length) return null;
    const result = {
      lat:         parseFloat(data[0].lat),
      lon:         parseFloat(data[0].lon),
      displayName: data[0].display_name?.split(',').slice(0,2).join(', ') || postcode,
    };
    cacheSet(key, result);
    return result;
  } catch { return null; }
}

export async function searchNearbyPlaces(
  lat: number, lon: number,
  searchTerm: string,
  cacheKey: string,
  limit = 3,
): Promise<OsmPlace[]> {
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const delta   = 0.15;
  const viewbox = `${lon-delta},${lat+delta},${lon+delta},${lat-delta}`;
  const url     = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&viewbox=${viewbox}&bounded=1&format=json&limit=${limit*3}&addressdetails=1&extratags=1`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'PetRoamID/1.0' },
    signal:  AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data: any[] = await res.json();

  const places: OsmPlace[] = data
    .filter(r => r.display_name && r.lat && r.lon)
    .map(r => {
      const addr = r.address ?? {};
      const addressStr = [
        addr.house_number && addr.road ? `${addr.house_number} ${addr.road}` : addr.road,
        addr.city || addr.town || addr.village || addr.suburb,
        addr.postcode,
      ].filter(Boolean).join(', ') || r.display_name.split(',').slice(0,3).join(',');
      return {
        id:      parseInt(r.osm_id) || Math.random()*1e9,
        name:    r.name || r.display_name.split(',')[0],
        lat:     parseFloat(r.lat),
        lon:     parseFloat(r.lon),
        address: addressStr,
        phone:   r.extratags?.phone || r.extratags?.['contact:phone'],
        website: r.extratags?.website || r.extratags?.['contact:website'],
        distKm:  haversine(lat, lon, parseFloat(r.lat), parseFloat(r.lon)),
      } as OsmPlace;
    })
    .sort((a,b) => a.distKm-b.distKm)
    .slice(0, limit);

  cacheSet(cacheKey, places);
  return places;
}
