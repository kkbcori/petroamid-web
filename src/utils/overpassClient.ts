// ─────────────────────────────────────────────────────────────────────────────
// Overpass API client with mirror fallback + sessionStorage cache
// ─────────────────────────────────────────────────────────────────────────────

// Multiple public mirrors — tried in order, first success wins
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];

export interface OsmPlace {
  id:            number;
  name:          string;
  lat:           number;
  lon:           number;
  address:       string;
  phone?:        string;
  website?:      string;
  stars?:        string;
  opening_hours?: string;
  distKm:        number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function queryMirror(mirror: string, query: string): Promise<any> {
  const res = await fetch(mirror, {
    method:  'POST',
    body:    `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal:  AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function queryOverpass(
  query: string,
  cacheKey: string,
): Promise<any> {
  // Check sessionStorage cache first (expires with browser tab)
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }

  let lastError: Error | null = null;

  for (const mirror of MIRRORS) {
    try {
      const data = await queryMirror(mirror, query);
      // Cache the result
      try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* ignore */ }
      return data;
    } catch (e) {
      lastError = e as Error;
      console.warn(`Overpass mirror failed (${mirror}):`, (e as Error).message);
    }
  }

  throw new Error(`All Overpass mirrors failed. Last error: ${lastError?.message}`);
}

export function parseOsmPlaces(
  elements: any[],
  lat: number,
  lon: number,
  limit = 3,
): OsmPlace[] {
  return elements
    .map((el: any) => {
      const t    = el.tags ?? {};
      const eLat = el.lat ?? el.center?.lat;
      const eLon = el.lon ?? el.center?.lon;
      if (!eLat || !eLon || !t.name) return null;
      const addr = [t['addr:housenumber'], t['addr:street'], t['addr:city']]
        .filter(Boolean).join(' ') || t['addr:full'] || 'Address not listed';
      return {
        id:            el.id,
        name:          t.name,
        lat:           eLat,
        lon:           eLon,
        address:       addr,
        phone:         t.phone || t['contact:phone'],
        website:       t.website || t['contact:website'],
        stars:         t.stars,
        opening_hours: t.opening_hours,
        distKm:        haversine(lat, lon, eLat, eLon),
      } as OsmPlace;
    })
    .filter((p): p is OsmPlace => p !== null)
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, limit);
}

export async function geocodePostcode(
  postcode: string,
): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = `geo:${postcode.toLowerCase().trim()}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }

  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'PetRoamID/1.0' } }
    );
    const data = await res.json();
    if (!data.length) return null;
    const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch { /* ignore */ }
    return result;
  } catch {
    return null;
  }
}
