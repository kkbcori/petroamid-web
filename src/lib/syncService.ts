// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Supabase Sync Service
//
// Strategy: "last-write-wins" upsert
//   • On app load (and tab focus): pull from Supabase → hydrate local store
//   • On every data mutation: debounced push to Supabase
//   • Offline: writes stay in localStorage; sync on next successful push
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabase';
import type { Pet, Trip, PurchaseRecord } from '../store/appStore';

export interface CloudData {
  pets:      Pet[];
  trips:     Trip[];
  purchases: PurchaseRecord[];
  updatedAt: string;
}

// ── Pull ──────────────────────────────────────────────────────────────────────
export async function pullFromCloud(userId: string): Promise<CloudData | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('pets, trips, purchases, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) { console.error('[sync] pull error:', error.message); return null; }
  if (!data)  return null;

  return {
    pets:      (data.pets      as Pet[])            ?? [],
    trips:     (data.trips     as Trip[])           ?? [],
    purchases: (data.purchases as PurchaseRecord[]) ?? [],
    updatedAt: data.updated_at,
  };
}

// ── Push ──────────────────────────────────────────────────────────────────────
export async function pushToCloud(
  userId: string,
  payload: { pets: Pet[]; trips: Trip[]; purchases: PurchaseRecord[] },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_data')
    .upsert(
      {
        user_id:   userId,
        pets:      payload.pets,
        trips:     payload.trips,
        purchases: payload.purchases,
      },
      { onConflict: 'user_id' },
    );

  if (error) return { error: error.message };
  return { error: null };
}

// ── Debounce helper ───────────────────────────────────────────────────────────
let _pushTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedPush(
  userId: string,
  payload: { pets: Pet[]; trips: Trip[]; purchases: PurchaseRecord[] },
  onResult: (err: string | null) => void,
  delayMs = 1200,
) {
  if (_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(async () => {
    const { error } = await pushToCloud(userId, payload);
    onResult(error);
    _pushTimer = null;
  }, delayMs);
}

// ── JSON file export (offline fallback, unchanged) ────────────────────────────
export function downloadJSON(payload: { pets: Pet[]; trips: Trip[]; purchases: PurchaseRecord[] }, name: string) {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...payload }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `PetRoamID_${name}_${new Date().toISOString().slice(0, 10)}.petroamid`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(): Promise<{ pets: Pet[]; trips: Trip[]; purchases: PurchaseRecord[] }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.petroamid,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { reject(new Error('No file selected')); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (!data.pets || !data.trips) throw new Error('Invalid file');
          resolve({ pets: data.pets, trips: data.trips, purchases: data.purchases ?? [] });
        } catch (err) { reject(err); }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
