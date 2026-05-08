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

// ── Care tracker types ────────────────────────────────────────────────────────
export interface FoodMeal {
  time: string;     // 'HH:mm'
  portion: string;
}

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  frequency: 'once' | 'twice' | 'three' | 'custom';
  intervalHours?: number;
  times: string[];  // resolved reminder times in 'HH:mm'
  startDate: string;
  endDate?: string;
}

export interface CareSchedule {
  petId: string;
  food: {
    enabled: boolean;
    meals: FoodMeal[];
  };
  water: {
    enabled: boolean;
    times: string[];
  };
  activity: {
    enabled: boolean;
    targetMinutes: number;
    reminderTimes: string[];
  };
  medicine: Medicine[];
  grooming: {
    enabled: boolean;
    intervalDays: number;
    lastDone?: string;
  };
  vet: {
    enabled: boolean;
    intervalMonths: number;
    lastVisit?: string;
    nextDue?: string;
  };
}

export type ActivityType = 'Walk' | 'Play' | 'Training' | 'Swim' | 'Other';

export interface ActivitySession {
  type: ActivityType;
  minutes: number;
  note: string;
  time: string;     // 'HH:mm'
}

export interface DailyLog {
  petId: string;
  date: string;     // 'YYYY-MM-DD'
  food: boolean[];
  water: boolean[];
  activity: {
    completed: boolean;
    minutesLogged: number;
    sessions: ActivitySession[];
  };
  medicine: Record<string, boolean>;
  grooming: boolean;
  vet: boolean;
  notes: string;
}

export function defaultCareSchedule(petId: string): CareSchedule {
  return {
    petId,
    food:     { enabled: false, meals: [] },
    water:    { enabled: false, times: [] },
    activity: { enabled: false, targetMinutes: 30, reminderTimes: [] },
    medicine: [],
    grooming: { enabled: false, intervalDays: 30 },
    vet:      { enabled: false, intervalMonths: 12 },
  };
}

export function emptyDailyLog(petId: string, date: string, schedule?: CareSchedule): DailyLog {
  const foodCount = schedule?.food.enabled ? schedule.food.meals.length : 0;
  const waterCount = schedule?.water.enabled ? schedule.water.times.length : 0;
  return {
    petId,
    date,
    food:     new Array(foodCount).fill(false),
    water:    new Array(waterCount).fill(false),
    activity: { completed: false, minutesLogged: 0, sessions: [] },
    medicine: {},
    grooming: false,
    vet:      false,
    notes:    '',
  };
}

interface AppState {
  pets:      Pet[];
  trips:     Trip[];
  purchases: Purchase[];
  careSchedules: CareSchedule[];
  dailyLogs:     DailyLog[];

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

  // Care tracker
  getCareSchedule: (petId: string) => CareSchedule;
  setCareSchedule: (petId: string, schedule: CareSchedule) => void;
  getDailyLog:     (petId: string, date: string) => DailyLog;
  updateDailyLog:  (petId: string, date: string, updates: Partial<DailyLog>) => void;
  toggleLogItem:   (petId: string, date: string, key: 'grooming' | 'vet') => void;
  toggleFoodSlot:  (petId: string, date: string, idx: number) => void;
  toggleWaterSlot: (petId: string, date: string, idx: number) => void;
  toggleMedicine:  (petId: string, date: string, medicineId: string) => void;
  logActivitySession: (petId: string, date: string, session: ActivitySession) => void;

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
        careSchedules: [], dailyLogs: [],

        addPet:    (pet)          => set(s => ({ pets: [...s.pets, pet] })),
        updatePet: (id, updates)  => set(s => ({ pets: s.trips ? s.pets.map(p => p.id === id ? { ...p, ...updates } : p) : s.pets.map(p => p.id === id ? { ...p, ...updates } : p) })),
        deletePet: (id)           => set(s => ({
          pets:  s.pets.filter(p => p.id !== id),
          trips: s.trips.filter(t => t.petId !== id && !(t.petIds ?? []).includes(id)),
          careSchedules: s.careSchedules.filter(c => c.petId !== id),
          dailyLogs:     s.dailyLogs.filter(l => l.petId !== id),
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

        // ── Care tracker actions ─────────────────────────────────────────
        getCareSchedule: (petId) => {
          const s = get().careSchedules.find(c => c.petId === petId);
          return s ?? defaultCareSchedule(petId);
        },

        setCareSchedule: (petId, schedule) => set(s => {
          const exists = s.careSchedules.some(c => c.petId === petId);
          return {
            careSchedules: exists
              ? s.careSchedules.map(c => c.petId === petId ? schedule : c)
              : [...s.careSchedules, schedule],
          };
        }),

        getDailyLog: (petId, date) => {
          const log = get().dailyLogs.find(l => l.petId === petId && l.date === date);
          if (log) return log;
          const schedule = get().careSchedules.find(c => c.petId === petId);
          return emptyDailyLog(petId, date, schedule);
        },

        updateDailyLog: (petId, date, updates) => set(s => {
          const idx = s.dailyLogs.findIndex(l => l.petId === petId && l.date === date);
          if (idx >= 0) {
            const next = [...s.dailyLogs];
            next[idx] = { ...next[idx], ...updates };
            return { dailyLogs: next };
          }
          const schedule = s.careSchedules.find(c => c.petId === petId);
          const fresh = { ...emptyDailyLog(petId, date, schedule), ...updates };
          return { dailyLogs: [...s.dailyLogs, fresh] };
        }),

        toggleLogItem: (petId, date, key) => {
          const current = get().getDailyLog(petId, date);
          get().updateDailyLog(petId, date, { [key]: !current[key] } as Partial<DailyLog>);
        },

        toggleFoodSlot: (petId, date, idx) => {
          const current = get().getDailyLog(petId, date);
          const food = [...current.food];
          food[idx] = !food[idx];
          get().updateDailyLog(petId, date, { food });
        },

        toggleWaterSlot: (petId, date, idx) => {
          const current = get().getDailyLog(petId, date);
          const water = [...current.water];
          water[idx] = !water[idx];
          get().updateDailyLog(petId, date, { water });
        },

        toggleMedicine: (petId, date, medicineId) => {
          const current = get().getDailyLog(petId, date);
          const medicine = { ...current.medicine, [medicineId]: !current.medicine[medicineId] };
          get().updateDailyLog(petId, date, { medicine });
        },

        logActivitySession: (petId, date, session) => {
          const current = get().getDailyLog(petId, date);
          const sessions = [...current.activity.sessions, session];
          const minutesLogged = current.activity.minutesLogged + session.minutes;
          const schedule = get().careSchedules.find(c => c.petId === petId);
          const target = schedule?.activity.targetMinutes ?? 0;
          const completed = target > 0 ? minutesLogged >= target : true;
          get().updateDailyLog(petId, date, {
            activity: { completed, minutesLogged, sessions },
          });
        },

        exportAsJSON: () => {
          const { pets, trips, purchases, careSchedules, dailyLogs } = get();
          return JSON.stringify({
            version: 2,
            exportedAt: new Date().toISOString(),
            pets, trips, purchases, careSchedules, dailyLogs,
          });
        },

        importFromJSON: (json) => {
          try {
            const data = JSON.parse(json);
            if (!data.pets || !data.trips) return { success: false, error: 'Invalid backup: missing pets or trips' };
            set({
              pets: data.pets,
              trips: data.trips,
              purchases: data.purchases ?? [],
              careSchedules: data.careSchedules ?? [],
              dailyLogs:     data.dailyLogs ?? [],
            });
            return { success: true };
          } catch (e) {
            return { success: false, error: `Parse error: ${(e as Error).message}` };
          }
        },

        clearAll: () => {
          set({ pets: [], trips: [], purchases: [], careSchedules: [], dailyLogs: [] });
          // Also wipe the persisted storage key so it doesn't reload on next render
          try { localStorage.removeItem(`petroamid-${profileId}`); } catch { /* ignore */ }
        },
      }),
      { name: `petroamid-${profileId}`, storage: createJSONStorage(() => localStorage) }
    )
  );
}

export type AppStore = ReturnType<ReturnType<typeof createAppStore>['getState']>;

// Alias for backward compatibility
export const getAppStore = createAppStore;
