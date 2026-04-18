// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – App Data Store  (local-only, no backend)
// Identical business logic to React Native app.
// Storage: localStorage keyed per profile ID.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DestinationCountry, PetType, TravelScenario, ChecklistItem } from '../data/travelRequirements';
import { applyPetProfileToChecklist } from '../utils/timelineCalculator';

export const FREE_PET_LIMIT     = 1;
export const FREE_TRIP_LIMIT    = 1;
export const FREE_CHECKLIST_IDS = ['microchip'];

export function hasValidVaccination(vaccinations: VaccinationRecord[]): boolean {
  if (!vaccinations?.length) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return vaccinations.some(v => {
    if (!v.nextDueDate) return true;
    try { return new Date(v.nextDueDate) >= today; } catch { return false; }
  });
}

function syncVaccinationChecklistForPet(trips: Trip[], petId: string, vaccinations: VaccinationRecord[]): Trip[] {
  const hasValid = hasValidVaccination(vaccinations);
  return trips.map(trip => {
    if (!(trip.petIds ?? [trip.petId]).includes(petId)) return trip;
    const vacIds = (trip.checklist ?? []).filter((ci: ChecklistItem) => ci.category === 'vaccination').map((ci: ChecklistItem) => ci.id);
    if (!vacIds.length) return trip;
    const updatedCS = { ...trip.checklistState };
    vacIds.forEach((id: string) => { updatedCS[id] = { completed: hasValid, completedDate: hasValid ? new Date().toISOString() : undefined }; });
    return {
      ...trip, checklistState: updatedCS,
      checklist: (trip.checklist ?? []).map((ci: ChecklistItem) => ci.category === 'vaccination' ? { ...ci, completed: hasValid } : ci),
    };
  });
}

// ── Entities ──────────────────────────────────────────────────────────────────
export interface VaccinationRecord {
  id: string; vaccineName: string; dateAdministered: string;
  nextDueDate?: string; batchNumber?: string; veterinarianName?: string;
  clinicName?: string; notes?: string;
}

export interface Pet {
  id: string; name: string; species: PetType;
  breed?: string; dateOfBirth: string; microchipNumber?: string;
  color?: string; avatarEmoji?: string;
  vaccinations: VaccinationRecord[]; createdAt: string;
  vetName?: string; vetPhone?: string; vetClinic?: string;
}

export interface Trip {
  id: string; petId: string; petIds: string[];
  originCountryCode: string; destination: DestinationCountry;
  travelDate: string; isUSVaccinated?: boolean;
  scenario: TravelScenario; checklist: ChecklistItem[];
  checklistState: Record<string, { completed: boolean; completedDate?: string }>;
  createdAt: string; isPremium: boolean; tripName?: string;
}

export interface PurchaseRecord {
  tripId: string; purchasedAt: string; amountCents: number;
}

export interface AppState {
  pets: Pet[]; trips: Trip[]; purchases: PurchaseRecord[];

  addPet:    (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;

  addVaccination:    (petId: string, rec: VaccinationRecord) => void;
  updateVaccination: (petId: string, recId: string, updates: Partial<VaccinationRecord>) => void;
  deleteVaccination: (petId: string, recId: string) => void;

  addTrip:    (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  toggleChecklistItem: (tripId: string, itemId: string) => void;
  unlockTrip:          (tripId: string) => void;

  exportAsJSON:   () => string;
  importFromJSON: (json: string) => { success: boolean; error?: string };
  clearAll:       () => void;
}

export function createAppStore(profileId: string) {
  return create<AppState>()(
    persist(
      (set, get) => ({
        pets: [], trips: [], purchases: [],

        addPet: (pet) => set(s => ({ pets: [...s.pets, pet] })),
        updatePet: (id, updates) =>
          set(s => ({
            pets: s.pets.map(p => {
              if (p.id !== id) return p;
              const updated = { ...p, ...updates };
              s.trips.filter(t => t.petId === id).forEach(t => {
                get().updateTrip(t.id, {
                  checklist: applyPetProfileToChecklist(t.checklist ?? [], updated.dateOfBirth, updated.microchipNumber, new Date(t.travelDate)),
                });
              });
              return updated;
            }),
          })),
        deletePet: (id) =>
          set(s => ({
            pets: s.pets.filter(p => p.id !== id),
            trips: s.trips
              .map(t => { const ids = (t.petIds ?? [t.petId]).filter(pid => pid !== id); return ids.length ? { ...t, petIds: ids, petId: ids[0] } : null; })
              .filter((t): t is Trip => t !== null),
          })),

        addVaccination: (petId, rec) =>
          set(s => {
            const updatedPets = s.pets.map(p => p.id === petId ? { ...p, vaccinations: [...p.vaccinations, rec] } : p);
            const pet = updatedPets.find(p => p.id === petId);
            return { pets: updatedPets, trips: syncVaccinationChecklistForPet(s.trips, petId, pet?.vaccinations ?? []) };
          }),
        updateVaccination: (petId, recId, updates) =>
          set(s => {
            const updatedPets = s.pets.map(p => p.id === petId ? { ...p, vaccinations: p.vaccinations.map(v => v.id === recId ? { ...v, ...updates } : v) } : p);
            const pet = updatedPets.find(p => p.id === petId);
            return { pets: updatedPets, trips: syncVaccinationChecklistForPet(s.trips, petId, pet?.vaccinations ?? []) };
          }),
        deleteVaccination: (petId, recId) =>
          set(s => {
            const updatedPets = s.pets.map(p => p.id === petId ? { ...p, vaccinations: p.vaccinations.filter(v => v.id !== recId) } : p);
            const pet = updatedPets.find(p => p.id === petId);
            return { pets: updatedPets, trips: syncVaccinationChecklistForPet(s.trips, petId, pet?.vaccinations ?? []) };
          }),

        addTrip: (trip) =>
          set(s => {
            const ids = [...new Set(trip.petIds?.length ? trip.petIds : [trip.petId])];
            const pet = s.pets.find(p => p.id === ids[0]);
            const checklist = pet
              ? applyPetProfileToChecklist(trip.checklist ?? trip.scenario?.checklist ?? [], pet.dateOfBirth, pet.microchipNumber, new Date(trip.travelDate))
              : (trip.checklist ?? trip.scenario?.checklist ?? []);
            return { trips: [...s.trips, { ...trip, petId: ids[0], petIds: ids, checklist, isPremium: trip.isPremium ?? false }] };
          }),
        updateTrip: (id, updates) =>
          set(s => ({ trips: s.trips.map(t => t.id === id ? { ...t, ...updates } : t) })),
        deleteTrip: (id) =>
          set(s => ({ trips: s.trips.filter(t => t.id !== id) })),

        toggleChecklistItem: (tripId, itemId) =>
          set(s => {
            const trip = s.trips.find(t => t.id === tripId);
            if (!trip || (!trip.isPremium && !FREE_CHECKLIST_IDS.includes(itemId))) return {};
            const nowDone = !trip.checklistState[itemId]?.completed;
            return {
              trips: s.trips.map(t => t.id !== tripId ? t : {
                ...t,
                checklistState: { ...t.checklistState, [itemId]: { completed: nowDone, completedDate: nowDone ? new Date().toISOString() : undefined } },
                checklist: (t.checklist ?? []).map((ci: ChecklistItem) => ci.id === itemId ? { ...ci, completed: nowDone } : ci),
              }),
            };
          }),

        unlockTrip: (tripId) =>
          set(s => ({
            trips: s.trips.map(t => t.id !== tripId ? t : { ...t, isPremium: true }),
            purchases: [...s.purchases, { tripId, purchasedAt: new Date().toISOString(), amountCents: 299 }],
          })),

        exportAsJSON: () => {
          const { pets, trips, purchases } = get();
          return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), pets, trips, purchases }, null, 2);
        },
        importFromJSON: (json) => {
          try {
            const data = JSON.parse(json) as { pets?: Pet[]; trips?: Trip[]; purchases?: PurchaseRecord[] };
            if (!data.pets || !data.trips) return { success: false, error: 'Invalid file' };
            set({ pets: data.pets, trips: data.trips, purchases: data.purchases ?? [] });
            return { success: true };
          } catch (e) { return { success: false, error: String(e) }; }
        },
        clearAll: () => set({ pets: [], trips: [], purchases: [] }),
      }),
      {
        name: `petroam-data-${profileId}`,
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          if (!state) return;
          state.trips = state.trips.map(trip => {
            const petIds = trip.petIds?.length ? trip.petIds : [trip.petId];
            const pet = state.pets.find(p => p.id === petIds[0]);
            if (!pet) return { ...trip, petIds };
            return { ...trip, petIds, checklist: applyPetProfileToChecklist(trip.checklist ?? [], pet.dateOfBirth, pet.microchipNumber, new Date(trip.travelDate)) };
          });
        },
      },
    ),
  );
}

// Store cache — one instance per profile, reused across renders
const _cache: Record<string, ReturnType<typeof createAppStore>> = {};
export function getAppStore(profileId: string) {
  if (!_cache[profileId]) _cache[profileId] = createAppStore(profileId);
  return _cache[profileId];
}
