// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID Web — App Store (Zustand + localStorage)
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TravelScenario, ChecklistItem } from '../data/travelRequirements';

export const FREE_PET_LIMIT     = 1;
export const FREE_TRIP_LIMIT    = 1;
export const FREE_CHECKLIST_IDS = ['microchip'];

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  dateOfBirth: string;
  // Optional extended fields used by AddPetPage / PetsPage
  breed?: string;
  color?: string;
  microchipNumber?: string;
  avatarEmoji?: string;
  vetName?: string;
  vetPhone?: string;
  vetClinic?: string;
  vaccinations: VaccinationRecord[];
  createdAt: string;
}

export interface Trip {
  id: string;
  petId: string;
  petIds: string[];
  originCountryCode: string;
  destination: string;
  travelDate: string;
  isUSVaccinated?: boolean;
  scenario: TravelScenario;
  checklist: ChecklistItem[];
  checklistState: Record<string, boolean>;
  createdAt: string;
  isPremium: boolean;
  tripName?: string;
}

// Exported as both Purchase and PurchaseRecord for compatibility
export interface Purchase {
  id: string;
  tripId: string;
  purchasedAt: string;
}
export type PurchaseRecord = Purchase;

export interface ImportResult {
  success: boolean;
  error?: string;
}

interface AppState {
  pets:      Pet[];
  trips:     Trip[];
  purchases: Purchase[];

  addPet:    (pet: Pet)    => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;

  addTrip:    (trip: Trip)  => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  unlockTrip: (id: string) => void;

  toggleChecklistItem: (tripId: string, itemId: string) => void;

  addVaccination:    (petId: string, record: VaccinationRecord) => void;
  updateVaccination: (petId: string, recordId: string, updates: Partial<VaccinationRecord>) => void;
  deleteVaccination: (petId: string, recordId: string) => void;

  exportAsJSON:   () => string;
  importFromJSON: (json: string) => ImportResult;
  clearAll:       () => void;
}

export function hasValidVaccination(vaccinations: VaccinationRecord[] | null | undefined): boolean {
  if (!vaccinations?.length) return false;
  return vaccinations.some(v => {
    if (!v.nextDueDate) return true;
    const due = new Date(v.nextDueDate);
    return !isNaN(due.getTime()) && due > new Date();
  });
}

function syncVaccsToChecklist(checklist: ChecklistItem[], vaccinations: VaccinationRecord[]): ChecklistItem[] {
  const hasValid = hasValidVaccination(vaccinations);
  return checklist.map(item =>
    item.category === 'vaccination' ? { ...item, completed: hasValid } : item
  );
}

export function createAppStore(profileId: string) {
  return create<AppState>()(
    persist(
      (set, get) => ({
        pets: [], trips: [], purchases: [],

        addPet:    (pet)          => set(s => ({ pets: [...s.pets, pet] })),
        updatePet: (id, updates)  => set(s => ({ pets: s.trips ? s.pets.map(p => p.id === id ? { ...p, ...updates } : p) : s.pets.map(p => p.id === id ? { ...p, ...updates } : p) })),
        deletePet: (id)           => set(s => ({
          pets:  s.pets.filter(p => p.id !== id),
          trips: s.trips.filter(t => t.petId !== id && !(t.petIds ?? []).includes(id)),
        })),

        addTrip:    (trip)         => set(s => ({ trips: [...s.trips, trip] })),
        updateTrip: (id, updates)  => set(s => ({ trips: s.trips.map(t => t.id === id ? { ...t, ...updates } : t) })),
        deleteTrip: (id)           => set(s => ({ trips: s.trips.filter(t => t.id !== id) })),
        unlockTrip: (id)           => set(s => ({
          trips: s.trips.map(t => t.id === id ? { ...t, isPremium: true } : t),
          purchases: [...s.purchases, { id: Math.random().toString(36).slice(2), tripId: id, purchasedAt: new Date().toISOString() }],
        })),

        toggleChecklistItem: (tripId, itemId) => set(s => ({
          trips: s.trips.map(t => {
            if (t.id !== tripId) return t;
            const isLocked = !t.isPremium && !FREE_CHECKLIST_IDS.includes(itemId);
            if (isLocked) return t;
            return { ...t, checklist: t.checklist.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c) };
          }),
        })),

        addVaccination: (petId, record) => set(s => {
          const pets  = s.pets.map(p => p.id !== petId ? p : { ...p, vaccinations: [...(p.vaccinations ?? []), record] });
          const pet   = pets.find(p => p.id === petId);
          const trips = s.trips.map(t => t.petId !== petId ? t : { ...t, checklist: syncVaccsToChecklist(t.checklist, pet?.vaccinations ?? []) });
          return { pets, trips };
        }),

        updateVaccination: (petId, recordId, updates) => set(s => ({
          pets: s.pets.map(p => p.id !== petId ? p : {
            ...p, vaccinations: (p.vaccinations ?? []).map(v => v.id === recordId ? { ...v, ...updates } : v),
          }),
        })),

        deleteVaccination: (petId, recordId) => set(s => {
          const pets  = s.pets.map(p => p.id !== petId ? p : { ...p, vaccinations: (p.vaccinations ?? []).filter(v => v.id !== recordId) });
          const pet   = pets.find(p => p.id === petId);
          const trips = s.trips.map(t => t.petId !== petId ? t : { ...t, checklist: syncVaccsToChecklist(t.checklist, pet?.vaccinations ?? []) });
          return { pets, trips };
        }),

        exportAsJSON: () => {
          const { pets, trips, purchases } = get();
          return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), pets, trips, purchases });
        },

        importFromJSON: (json) => {
          try {
            const data = JSON.parse(json);
            if (!data.pets || !data.trips) return { success: false, error: 'Invalid backup: missing pets or trips' };
            set({ pets: data.pets, trips: data.trips, purchases: data.purchases ?? [] });
            return { success: true };
          } catch (e) {
            return { success: false, error: `Parse error: ${(e as Error).message}` };
          }
        },

        clearAll: () => {
          set({ pets: [], trips: [], purchases: [] });
          // Also wipe the persisted storage key so it doesn't reload on next render
          try { localStorage.removeItem(`petroamid-${profileId}`); } catch { /* ignore */ }
        },
      }),
      { name: `petroamid-${profileId}`, storage: createJSONStorage(() => localStorage) }
    )
  );
}

export type AppStore = ReturnType<ReturnType<typeof createAppStore>['getState']>;
