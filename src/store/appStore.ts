// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – App Data Store  (Supabase-synced)
//
// Architecture:
//   • localStorage  = fast offline cache (instant reads on load)
//   • Supabase      = source of truth + real-time cross-device sync
//   • Write path:   write localStorage first (optimistic) → then upsert Supabase
//   • Read path:    load from localStorage on mount → then fetch Supabase (merge)
//   • Real-time:    Supabase subscription pushes remote changes in-band
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { applyPetProfileToChecklist } from '../utils/timelineCalculator';
import type { DestinationCountry, PetType, TravelScenario, ChecklistItem } from '../data/travelRequirements';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const FREE_PET_LIMIT       = 1;
export const FREE_TRIP_LIMIT      = 1;
export const FREE_CHECKLIST_IDS   = ['microchip'];

export function hasValidVaccination(vaccinations: VaccinationRecord[]): boolean {
  if (!vaccinations?.length) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return vaccinations.some(v => {
    if (!v.nextDueDate) return true;
    try { return new Date(v.nextDueDate) >= today; } catch { return false; }
  });
}

// ── Entity types (identical to RN app) ────────────────────────────────────────
export interface VaccinationRecord {
  id: string; vaccineName: string; dateAdministered: string;
  nextDueDate?: string; batchNumber?: string;
  veterinarianName?: string; clinicName?: string; notes?: string; documentUri?: string;
}
export interface Pet {
  id: string; name: string; species: PetType; breed?: string;
  dateOfBirth: string; microchipNumber?: string; color?: string; avatarEmoji?: string;
  vaccinations: VaccinationRecord[]; createdAt: string;
  vetName?: string; vetPhone?: string; vetClinic?: string;
}
export interface Trip {
  id: string; petId: string; petIds: string[];
  originCountryCode: string; destination: DestinationCountry;
  travelDate: string; isUSVaccinated?: boolean;
  scenario: TravelScenario; checklist: ChecklistItem[];
  checklistState: Record<string, { completed: boolean; completedDate?: string }>;
  createdAt: string; isPremium: boolean; premiumPurchasedAt?: string; tripName?: string;
}
export interface PurchaseRecord {
  tripId: string; purchasedAt: string; transactionId?: string; amountCents: number;
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface AppState {
  pets:          Pet[];
  trips:         Trip[];
  purchases:     PurchaseRecord[];
  syncing:       boolean;
  syncError:     string | null;
  lastSyncedAt:  string | null;
  _channel:      RealtimeChannel | null;

  // Init / teardown
  init:          (userId: string) => Promise<void>;
  teardown:      () => void;

  // Pets
  canAddPet:  () => boolean;
  canAddTrip: () => boolean;
  addPet:     (pet: Pet) => Promise<void>;
  updatePet:  (id: string, updates: Partial<Pet>) => Promise<void>;
  deletePet:  (id: string) => Promise<void>;

  // Vaccinations
  addVaccination:    (petId: string, rec: VaccinationRecord) => Promise<void>;
  updateVaccination: (petId: string, recId: string, updates: Partial<VaccinationRecord>) => Promise<void>;
  deleteVaccination: (petId: string, recId: string) => Promise<void>;

  // Trips
  addTrip:    (trip: Trip) => Promise<void>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  toggleChecklistItem: (tripId: string, itemId: string) => Promise<void>;
  unlockTrip: (tripId: string, transactionId?: string) => Promise<void>;

  // Offline fallback
  exportAsJSON:    () => string;
  importFromJSON:  (json: string) => Promise<{ success: boolean; error?: string }>;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────
function cacheKey(userId: string) { return `petroam-cache-${userId}`; }
function saveCache(userId: string, pets: Pet[], trips: Trip[], purchases: PurchaseRecord[]) {
  try { localStorage.setItem(cacheKey(userId), JSON.stringify({ pets, trips, purchases, savedAt: new Date().toISOString() })); } catch { /* noop */ }
}
function loadCache(userId: string): { pets: Pet[]; trips: Trip[]; purchases: PurchaseRecord[] } | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function syncVaccForPet(trips: Trip[], petId: string, vaccinations: VaccinationRecord[]): Trip[] {
  const hasValid = hasValidVaccination(vaccinations);
  return trips.map(trip => {
    const petIds = trip.petIds ?? [trip.petId];
    if (!petIds.includes(petId)) return trip;
    const vacIds = (trip.checklist ?? []).filter(ci => ci.category === 'vaccination').map(ci => ci.id);
    if (!vacIds.length) return trip;
    const cs = { ...trip.checklistState };
    vacIds.forEach(id => { cs[id] = { completed: hasValid, completedDate: hasValid ? new Date().toISOString() : undefined }; });
    return {
      ...trip, checklistState: cs,
      checklist: (trip.checklist ?? []).map(ci => ci.category === 'vaccination' ? { ...ci, completed: hasValid } : ci),
    };
  });
}

// ── Store factory ─────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  pets: [], trips: [], purchases: [], syncing: false, syncError: null,
  lastSyncedAt: null, _channel: null,

  // ── Initialise: load cache → fetch Supabase → subscribe realtime ──────────
  init: async (userId: string) => {
    // 1. Hydrate from cache immediately (fast, works offline)
    const cached = loadCache(userId);
    if (cached) set({ pets: cached.pets, trips: cached.trips, purchases: cached.purchases });

    // 2. Fetch from Supabase (merge over cache)
    set({ syncing: true, syncError: null });
    try {
      const [petsRes, tripsRes, purchasesRes] = await Promise.all([
        supabase.from('pets').select('data').eq('user_id', userId).order('created_at'),
        supabase.from('trips').select('data').eq('user_id', userId).order('created_at'),
        supabase.from('purchases').select('data').eq('user_id', userId).order('created_at'),
      ]);
      const pets      = (petsRes.data      ?? []).map((r: any) => r.data as Pet);
      const trips     = (tripsRes.data     ?? []).map((r: any) => r.data as Trip);
      const purchases = (purchasesRes.data ?? []).map((r: any) => r.data as PurchaseRecord);

      set({ pets, trips, purchases, syncing: false, lastSyncedAt: new Date().toISOString() });
      saveCache(userId, pets, trips, purchases);
    } catch (e) {
      set({ syncing: false, syncError: 'Sync failed — using local data.' });
    }

    // 3. Realtime subscription (fires when another device saves)
    const channel = supabase.channel(`petroam-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pets',  filter: `user_id=eq.${userId}` },
        () => get().init(userId)) // re-fetch on any remote change
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips', filter: `user_id=eq.${userId}` },
        () => get().init(userId))
      .subscribe();

    set({ _channel: channel });
  },

  teardown: () => {
    const { _channel } = get();
    if (_channel) supabase.removeChannel(_channel);
    set({ pets: [], trips: [], purchases: [], _channel: null });
  },

  // ── Helpers ──────────────────────────────────────────────────────────────
  canAddPet:  () => get().pets.length  < FREE_PET_LIMIT,
  canAddTrip: () => get().trips.length < FREE_TRIP_LIMIT,

  // ── Write helper — optimistic local + Supabase upsert ────────────────────
  addPet: async (pet) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => { const pets = [...s.pets, pet]; saveCache(userId, pets, s.trips, s.purchases); return { pets }; });
    await supabase.from('pets').upsert({ id: pet.id, user_id: userId, data: pet });
  },

  updatePet: async (id, updates) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => {
      const pets = s.pets.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        // Re-apply pet profile to affected trips
        s.trips.filter(t => (t.petIds ?? [t.petId]).includes(id)).forEach(t => {
          const newCL = applyPetProfileToChecklist(t.checklist ?? [], updated.dateOfBirth, updated.microchipNumber, new Date(t.travelDate));
          supabase.from('trips').update({ data: { ...t, checklist: newCL } }).eq('id', t.id).eq('user_id', userId);
        });
        return updated;
      });
      saveCache(userId, pets, s.trips, s.purchases);
      return { pets };
    });
    const pet = get().pets.find(p => p.id === id);
    if (pet) await supabase.from('pets').update({ data: pet }).eq('id', id).eq('user_id', userId);
  },

  deletePet: async (id) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => {
      const pets  = s.pets.filter(p => p.id !== id);
      const trips = s.trips
        .map(t => { const ids = (t.petIds ?? [t.petId]).filter(pid => pid !== id); if (!ids.length) return null; return { ...t, petIds: ids, petId: ids[0] }; })
        .filter(Boolean) as Trip[];
      saveCache(userId, pets, trips, s.purchases);
      return { pets, trips };
    });
    await supabase.from('pets').delete().eq('id', id).eq('user_id', userId);
  },

  addVaccination: async (petId, rec) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => {
      const pets  = s.pets.map(p => p.id === petId ? { ...p, vaccinations: [...p.vaccinations, rec] } : p);
      const pet   = pets.find(p => p.id === petId);
      const trips = syncVaccForPet(s.trips, petId, pet?.vaccinations ?? []);
      saveCache(userId, pets, trips, s.purchases);
      return { pets, trips };
    });
    const pet = get().pets.find(p => p.id === petId);
    if (pet) await supabase.from('pets').update({ data: pet }).eq('id', petId).eq('user_id', userId);
  },

  updateVaccination: async (petId, recId, updates) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => {
      const pets  = s.pets.map(p => p.id === petId ? { ...p, vaccinations: p.vaccinations.map(v => v.id === recId ? { ...v, ...updates } : v) } : p);
      const pet   = pets.find(p => p.id === petId);
      const trips = syncVaccForPet(s.trips, petId, pet?.vaccinations ?? []);
      saveCache(userId, pets, trips, s.purchases);
      return { pets, trips };
    });
    const pet = get().pets.find(p => p.id === petId);
    if (pet) await supabase.from('pets').update({ data: pet }).eq('id', petId).eq('user_id', userId);
  },

  deleteVaccination: async (petId, recId) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => {
      const pets  = s.pets.map(p => p.id === petId ? { ...p, vaccinations: p.vaccinations.filter(v => v.id !== recId) } : p);
      const pet   = pets.find(p => p.id === petId);
      const trips = syncVaccForPet(s.trips, petId, pet?.vaccinations ?? []);
      saveCache(userId, pets, trips, s.purchases);
      return { pets, trips };
    });
    const pet = get().pets.find(p => p.id === petId);
    if (pet) await supabase.from('pets').update({ data: pet }).eq('id', petId).eq('user_id', userId);
  },

  addTrip: async (trip) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    const ids = [...new Set(trip.petIds?.length ? trip.petIds : [trip.petId])];
    const primaryPet = get().pets.find(p => p.id === ids[0]);
    const checklist  = primaryPet
      ? applyPetProfileToChecklist(trip.checklist ?? trip.scenario?.checklist ?? [], primaryPet.dateOfBirth, primaryPet.microchipNumber, new Date(trip.travelDate))
      : (trip.checklist ?? trip.scenario?.checklist ?? []);
    const fullTrip = { ...trip, petId: ids[0], petIds: ids, checklist, isPremium: trip.isPremium ?? false };
    set(s => { const trips = [...s.trips, fullTrip]; saveCache(userId, s.pets, trips, s.purchases); return { trips }; });
    await supabase.from('trips').upsert({ id: fullTrip.id, user_id: userId, data: fullTrip });
  },

  updateTrip: async (id, updates) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => { const trips = s.trips.map(t => t.id === id ? { ...t, ...updates } : t); saveCache(userId, s.pets, trips, s.purchases); return { trips }; });
    const trip = get().trips.find(t => t.id === id);
    if (trip) await supabase.from('trips').update({ data: trip }).eq('id', id).eq('user_id', userId);
  },

  deleteTrip: async (id) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => { const trips = s.trips.filter(t => t.id !== id); saveCache(userId, s.pets, trips, s.purchases); return { trips }; });
    await supabase.from('trips').delete().eq('id', id).eq('user_id', userId);
  },

  toggleChecklistItem: async (tripId, itemId) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    set(s => {
      const trip = s.trips.find(t => t.id === tripId); if (!trip) return {};
      if (!trip.isPremium && !FREE_CHECKLIST_IDS.includes(itemId)) return {};
      const nowDone = !trip.checklistState[itemId]?.completed;
      const trips = s.trips.map(t => t.id !== tripId ? t : {
        ...t,
        checklistState: { ...t.checklistState, [itemId]: { completed: nowDone, completedDate: nowDone ? new Date().toISOString() : undefined } },
        checklist: (t.checklist ?? []).map(ci => ci.id === itemId ? { ...ci, completed: nowDone } : ci),
        scenario: { ...t.scenario, checklist: (t.scenario?.checklist ?? []).map(ci => ci.id === itemId ? { ...ci, completed: nowDone } : ci) },
      });
      saveCache(userId, s.pets, trips, s.purchases);
      return { trips };
    });
    const trip = get().trips.find(t => t.id === tripId);
    if (trip) await supabase.from('trips').update({ data: trip }).eq('id', tripId).eq('user_id', userId);
  },

  unlockTrip: async (tripId, transactionId) => {
    const userId = (await supabase.auth.getUser()).data.user?.id; if (!userId) return;
    const purchase: PurchaseRecord = { tripId, purchasedAt: new Date().toISOString(), transactionId, amountCents: 199 };
    set(s => {
      const trips     = s.trips.map(t => t.id !== tripId ? t : { ...t, isPremium: true, premiumPurchasedAt: new Date().toISOString() });
      const purchases = [...s.purchases, purchase];
      saveCache(userId, s.pets, trips, purchases);
      return { trips, purchases };
    });
    const trip = get().trips.find(t => t.id === tripId);
    if (trip) await supabase.from('trips').update({ data: trip }).eq('id', tripId).eq('user_id', userId);
    await supabase.from('purchases').insert({ user_id: userId, trip_id: tripId, data: purchase });
  },

  exportAsJSON: () => {
    const { pets, trips, purchases } = get();
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), pets, trips, purchases }, null, 2);
  },

  importFromJSON: async (json) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return { success: false, error: 'Not logged in' };
    try {
      const data = JSON.parse(json);
      if (!data.pets || !data.trips) return { success: false, error: 'Invalid file format' };
      // Upsert all pets and trips into Supabase
      await Promise.all([
        ...data.pets.map((p: Pet) => supabase.from('pets').upsert({ id: p.id, user_id: userId, data: p })),
        ...data.trips.map((t: Trip) => supabase.from('trips').upsert({ id: t.id, user_id: userId, data: t })),
      ]);
      set({ pets: data.pets, trips: data.trips, purchases: data.purchases ?? [] });
      saveCache(userId, data.pets, data.trips, data.purchases ?? []);
      return { success: true };
    } catch (e) { return { success: false, error: String(e) }; }
  },
}));
