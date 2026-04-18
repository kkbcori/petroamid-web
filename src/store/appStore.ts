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

function syncVaccinationChecklistForPet(
  trips: Trip[], petId: string, vaccinations: VaccinationRecord[],
): Trip[] {
  const hasValid = hasValidVaccination(vaccinations);
  return trips.map(trip => {
    const tripPetIds = trip.petIds ?? [trip.petId];
    if (!tripPetIds.includes(petId)) return trip;
    const vacIds = (trip.checklist ?? trip.scenario?.checklist ?? [])
      .filter((ci: ChecklistItem) => ci.category === 'vaccination').map((ci: ChecklistItem) => ci.id);
    if (!vacIds.length) return trip;
    const updatedCS = { ...trip.checklistState };
    vacIds.forEach((id: string) => {
      updatedCS[id] = { completed: hasValid, completedDate: hasValid ? new Date().toISOString() : undefined };
    });
    return {
      ...trip,
      checklistState: updatedCS,
      checklist: (trip.checklist ?? []).map((ci: ChecklistItem) =>
        ci.category === 'vaccination' ? { ...ci, completed: hasValid } : ci),
      scenario: trip.scenario ? {
        ...trip.scenario,
        checklist: (trip.scenario.checklist ?? []).map((ci: ChecklistItem) =>
          ci.category === 'vaccination' ? { ...ci, completed: hasValid } : ci),
      } : trip.scenario,
    };
  });
}

export interface VaccinationRecord {
  id: string; vaccineName: string; dateAdministered: string;
  nextDueDate?: string; batchNumber?: string; veterinarianName?: string;
  clinicName?: string; notes?: string; documentUri?: string;
}

export interface Pet {
  id: string; name: string; species: PetType; breed?: string;
  dateOfBirth: string; microchipNumber?: string; color?: string;
  avatarEmoji?: string; vaccinations: VaccinationRecord[]; createdAt: string;
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

export interface AppState {
  pets: Pet[]; trips: Trip[]; purchases: PurchaseRecord[];
  activePetId: string | null; activeTripId: string | null;
  canAddPet:  () => boolean;
  canAddTrip: () => boolean;
  addPet:     (pet: Pet) => void;
  updatePet:  (id: string, updates: Partial<Pet>) => void;
  deletePet:  (id: string) => void;
  setActivePet: (id: string | null) => void;
  addVaccination:    (petId: string, rec: VaccinationRecord) => void;
  updateVaccination: (petId: string, recId: string, updates: Partial<VaccinationRecord>) => void;
  deleteVaccination: (petId: string, recId: string) => void;
  addTrip:    (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (id: string | null) => void;
  toggleChecklistItem: (tripId: string, itemId: string) => void;
  unlockTrip: (tripId: string, transactionId?: string) => void;
  exportAsJSON:   () => string;
  importFromJSON: (json: string) => { success: boolean; error?: string };
  clearAll: () => void;
}

export function createAppStore(profileId: string) {
  return create<AppState>()(
    persist(
      (set, get) => ({
        pets: [], trips: [], purchases: [],
        activePetId: null, activeTripId: null,

        canAddPet:  () => get().pets.length  < FREE_PET_LIMIT,
        canAddTrip: () => get().trips.length < FREE_TRIP_LIMIT,

        addPet: (pet) => set(s => ({ pets: [...s.pets, pet] })),
        updatePet: (id, updates) =>
          set(s => ({
            pets: s.pets.map(p => {
              if (p.id !== id) return p;
              const updated = { ...p, ...updates };
              s.trips.filter(t => t.petId === id).forEach(t => {
                const newCL = applyPetProfileToChecklist(
                  t.checklist ?? t.scenario?.checklist ?? [],
                  updated.dateOfBirth, updated.microchipNumber, new Date(t.travelDate),
                );
                get().updateTrip(t.id, { checklist: newCL });
              });
              return updated;
            }),
          })),
        deletePet: (id) =>
          set(s => ({
            pets: s.pets.filter(p => p.id !== id),
            trips: s.trips
              .map(t => {
                const ids = (t.petIds ?? [t.petId]).filter(pid => pid !== id);
                if (!ids.length) return null;
                return { ...t, petIds: ids, petId: ids[0] };
              })
              .filter((t): t is Trip => t !== null),
            activePetId: s.activePetId === id ? null : s.activePetId,
          })),
        setActivePet: (id) => set({ activePetId: id }),

        addVaccination: (petId, rec) =>
          set(s => {
            const updatedPets = s.pets.map(p =>
              p.id === petId ? { ...p, vaccinations: [...p.vaccinations, rec] } : p);
            const pet = updatedPets.find(p => p.id === petId);
            return { pets: updatedPets, trips: syncVaccinationChecklistForPet(s.trips, petId, pet?.vaccinations ?? []) };
          }),
        updateVaccination: (petId, recId, updates) =>
          set(s => {
            const updatedPets = s.pets.map(p =>
              p.id === petId ? { ...p, vaccinations: p.vaccinations.map(v => v.id === recId ? { ...v, ...updates } : v) } : p);
            const pet = updatedPets.find(p => p.id === petId);
            return { pets: updatedPets, trips: syncVaccinationChecklistForPet(s.trips, petId, pet?.vaccinations ?? []) };
          }),
        deleteVaccination: (petId, recId) =>
          set(s => {
            const updatedPets = s.pets.map(p =>
              p.id === petId ? { ...p, vaccinations: p.vaccinations.filter(v => v.id !== recId) } : p);
            const pet = updatedPets.find(p => p.id === petId);
            return { pets: updatedPets, trips: syncVaccinationChecklistForPet(s.trips, petId, pet?.vaccinations ?? []) };
          }),

        addTrip: (trip) =>
          set(s => {
            const ids = [...new Set(trip.petIds?.length ? trip.petIds : [trip.petId])];
            const primaryPet = s.pets.find(p => p.id === ids[0]);
            const checklist = primaryPet
              ? applyPetProfileToChecklist(
                  trip.checklist ?? trip.scenario?.checklist ?? [],
                  primaryPet.dateOfBirth, primaryPet.microchipNumber, new Date(trip.travelDate),
                )
              : (trip.checklist ?? trip.scenario?.checklist ?? []);
            return { trips: [...s.trips, { ...trip, petId: ids[0], petIds: ids, checklist, isPremium: trip.isPremium ?? false }] };
          }),
        updateTrip: (id, updates) =>
          set(s => ({ trips: s.trips.map(t => t.id === id ? { ...t, ...updates } : t) })),
        deleteTrip: (id) =>
          set(s => ({
            trips: s.trips.filter(t => t.id !== id),
            activeTripId: s.activeTripId === id ? null : s.activeTripId,
          })),
        setActiveTrip: (id) => set({ activeTripId: id }),

        toggleChecklistItem: (tripId, itemId) =>
          set(s => {
            const trip = s.trips.find(t => t.id === tripId);
            if (!trip) return {};
            if (!trip.isPremium && !FREE_CHECKLIST_IDS.includes(itemId)) return {};
            const nowDone = !trip.checklistState[itemId]?.completed;
            return {
              trips: s.trips.map(t => t.id !== tripId ? t : {
                ...t,
                checklistState: { ...t.checklistState, [itemId]: { completed: nowDone, completedDate: nowDone ? new Date().toISOString() : undefined } },
                checklist: (t.checklist ?? []).map((ci: ChecklistItem) => ci.id === itemId ? { ...ci, completed: nowDone } : ci),
                scenario: { ...t.scenario, checklist: (t.scenario?.checklist ?? []).map((ci: ChecklistItem) => ci.id === itemId ? { ...ci, completed: nowDone } : ci) },
              }),
            };
          }),

        unlockTrip: (tripId, transactionId) =>
          set(s => ({
            trips: s.trips.map(t => t.id !== tripId ? t : { ...t, isPremium: true, premiumPurchasedAt: new Date().toISOString() }),
            purchases: [...s.purchases, { tripId, purchasedAt: new Date().toISOString(), transactionId, amountCents: 199 }],
          })),

        exportAsJSON: () => {
          const { pets, trips, purchases } = get();
          return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), pets, trips, purchases }, null, 2);
        },
        importFromJSON: (json) => {
          try {
            const data = JSON.parse(json) as { pets?: Pet[]; trips?: Trip[]; purchases?: PurchaseRecord[] };
            if (!data.pets || !data.trips) return { success: false, error: 'Invalid file format' };
            set({ pets: data.pets ?? [], trips: data.trips ?? [], purchases: data.purchases ?? [] });
            return { success: true };
          } catch (e) { return { success: false, error: String(e) }; }
        },
        clearAll: () => set({ pets: [], trips: [], purchases: [], activePetId: null, activeTripId: null }),
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
            return { ...trip, petIds, checklist: applyPetProfileToChecklist(trip.checklist ?? trip.scenario?.checklist ?? [], pet.dateOfBirth, pet.microchipNumber, new Date(trip.travelDate)) };
          });
        },
      },
    ),
  );
}

const _storeCache: Record<string, ReturnType<typeof createAppStore>> = {};
export function getAppStore(profileId: string) {
  if (!_storeCache[profileId]) _storeCache[profileId] = createAppStore(profileId);
  return _storeCache[profileId];
}
