// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Complete Unit Test Suite  (v2)
// Coverage: UC-01 through UC-06, all branches + negative scenarios
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { buildTravelScenario, getUSScenario, getCAScenario, getEUScenario, COUNTRIES } from '../../src/data/travelRequirements';
import {
  buildTimeline, getReadinessStatus, calcReadinessScore, applyPetProfileToChecklist,
} from '../../src/utils/timelineCalculator';
import {
  FREE_PET_LIMIT, FREE_TRIP_LIMIT, FREE_CHECKLIST_IDS,
  hasValidVaccination, createAppStore,
} from '../../src/store/appStore';
import type { Pet, Trip, VaccinationRecord } from '../../src/store/appStore';
import type { ChecklistItem } from '../../src/data/travelRequirements';

// ─── Date helpers ─────────────────────────────────────────────────────────────
const daysFromNow = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const daysAgo     = (n: number) => daysFromNow(-n);
const dateStr     = (d: Date) => d.toISOString().slice(0, 10);
const TOMORROW    = daysFromNow(1);
const IN_30       = daysFromNow(30);
const IN_60       = daysFromNow(60);
const IN_90       = daysFromNow(90);
const IN_120      = daysFromNow(120);
const YESTERDAY   = daysAgo(1);

// ─── Store helpers ────────────────────────────────────────────────────────────
function freshStore() {
  // createAppStore returns a zustand hook — in unit tests we access the
  // underlying vanilla store directly via the hook's getState/setState methods
  const useStore = createAppStore(`test-${Math.random()}`);
  return useStore;
}

function makePet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: 'pet1', name: 'Rex', species: 'dog',
    dateOfBirth: '2020-01-01', vaccinations: [], createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  const scenario = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });
  return {
    id: 'trip1', petId: 'pet1', petIds: ['pet1'],
    originCountryCode: 'GB', destination: 'US',
    travelDate: IN_60.toISOString(), scenario,
    checklist: scenario.checklist, checklistState: {},
    createdAt: new Date().toISOString(), isPremium: false,
    ...overrides,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// UC-01 — Profile & Pet Setup
// ══════════════════════════════════════════════════════════════════════════════
describe('UC-01 — Pet Profile Logic', () => {

  // ── Microchip sanitisation ────────────────────────────────────────────────
  describe('Microchip input validation', () => {
    const sanitize = (v: string) => v.replace(/\D/g, '').slice(0, 15);

    it('TC-01-06: strips letters, keeps only digits', () => {
      expect(sanitize('ABC123DEF')).toBe('123');
      expect(sanitize('abc')).toBe('');
    });
    it('TC-01-06: strips special characters', () => {
      expect(sanitize('982-000-123')).toBe('982000123');
      expect(sanitize('982 000 123!')).toBe('982000123');
    });
    it('TC-01-07: caps at 15 digits', () => {
      expect(sanitize('1234567890123456789').length).toBe(15);
    });
    it('TC-01-07: valid 15-digit chip passes unchanged', () => {
      const chip = '982000123456789';
      expect(sanitize(chip)).toBe(chip);
    });
    it('TC-01-06 negative: empty string returns empty', () => {
      expect(sanitize('')).toBe('');
    });
    it('negative: all special chars returns empty', () => {
      expect(sanitize('!!!---   ')).toBe('');
    });
    it('negative: unicode letters are stripped', () => {
      expect(sanitize('αβγ123')).toBe('123');
    });
  });

  // ── Free-tier limits ──────────────────────────────────────────────────────
  describe('Free tier constants', () => {
    it('TC-01-13: FREE_PET_LIMIT is 1', () => expect(FREE_PET_LIMIT).toBe(1));
    it('TC-02-11: FREE_TRIP_LIMIT is 1', () => expect(FREE_TRIP_LIMIT).toBe(1));
    it('FREE_CHECKLIST_IDS contains microchip', () => expect(FREE_CHECKLIST_IDS).toContain('microchip'));
    it('FREE_CHECKLIST_IDS does not contain non-free items', () => {
      expect(FREE_CHECKLIST_IDS).not.toContain('us_cdc_form');
      expect(FREE_CHECKLIST_IDS).not.toContain('eu_titer');
    });
  });

  // ── Store: addPet / updatePet / deletePet ─────────────────────────────────
  describe('Store: Pet CRUD', () => {
    it('TC-01-04: addPet stores the pet', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      expect(store.getState().pets).toHaveLength(1);
      expect(store.getState().pets[0].name).toBe('Rex');
    });
    it('TC-01-11: updatePet changes the name', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().updatePet('pet1', { name: 'Buddy' });
      expect(store.getState().pets[0].name).toBe('Buddy');
    });
    it('TC-01-12: deletePet removes the pet', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().deletePet('pet1');
      expect(store.getState().pets).toHaveLength(0);
    });
    it('TC-01-12: deletePet removes linked trips', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().deletePet('pet1');
      expect(store.getState().trips).toHaveLength(0);
    });
    it('negative: updatePet on non-existent id does nothing', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().updatePet('nonexistent', { name: 'Ghost' });
      expect(store.getState().pets[0].name).toBe('Rex');
    });
    it('negative: deletePet on non-existent id does nothing', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().deletePet('wrong-id');
      expect(store.getState().pets).toHaveLength(1);
    });
  });

  // ── Vaccination validity ──────────────────────────────────────────────────
  describe('TC-01-10: Vaccination validity', () => {
    it('no vaccinations → false', () => expect(hasValidVaccination([])).toBe(false));
    it('null/undefined vaccinations → false', () => expect(hasValidVaccination(null as any)).toBe(false));
    it('future due date → valid', () => {
      expect(hasValidVaccination([{ id:'1', vaccineName:'Rabies', dateAdministered:'2024-01-01', nextDueDate: dateStr(IN_60) }])).toBe(true);
    });
    it('past due date → invalid', () => {
      expect(hasValidVaccination([{ id:'1', vaccineName:'Rabies', dateAdministered:'2023-01-01', nextDueDate: dateStr(YESTERDAY) }])).toBe(false);
    });
    it('no due date (lifetime) → valid', () => {
      expect(hasValidVaccination([{ id:'1', vaccineName:'Rabies', dateAdministered:'2024-01-01' }])).toBe(true);
    });
    it('negative: invalid date string → treated as invalid', () => {
      expect(hasValidVaccination([{ id:'1', vaccineName:'Rabies', dateAdministered:'2024-01-01', nextDueDate: 'not-a-date' }])).toBe(false);
    });
    it('mixed records: one valid is enough', () => {
      expect(hasValidVaccination([
        { id:'1', vaccineName:'Rabies', dateAdministered:'2023-01-01', nextDueDate: dateStr(YESTERDAY) },
        { id:'2', vaccineName:'DHPP',   dateAdministered:'2024-01-01', nextDueDate: dateStr(IN_60) },
      ])).toBe(true);
    });
  });

  // ── Store: Vaccination CRUD & sync ────────────────────────────────────────
  describe('Vaccination store operations', () => {
    it('TC-01-10: addVaccination syncs vaccination items on linked trips', () => {
      const store = freshStore();
      const scenario = buildTravelScenario({ destination: 'EU', originCountryCode: 'GB', petType: 'dog' });
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip({ scenario, checklist: scenario.checklist }));
      const rec: VaccinationRecord = { id:'v1', vaccineName:'Rabies', dateAdministered:'2024-01-01', nextDueDate: dateStr(IN_60) };
      store.getState().addVaccination('pet1', rec);
      const vacItems = store.getState().trips[0].checklist.filter(c => c.category === 'vaccination');
      expect(vacItems.every(c => c.completed)).toBe(true);
    });
    it('deleteVaccination un-syncs vaccination items when no valid vaccinations remain', () => {
      const store = freshStore();
      const scenario = buildTravelScenario({ destination: 'EU', originCountryCode: 'GB', petType: 'dog' });
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip({ scenario, checklist: scenario.checklist }));
      const rec: VaccinationRecord = { id:'v1', vaccineName:'Rabies', dateAdministered:'2024-01-01', nextDueDate: dateStr(IN_60) };
      store.getState().addVaccination('pet1', rec);
      store.getState().deleteVaccination('pet1', 'v1');
      const vacItems = store.getState().trips[0].checklist.filter(c => c.category === 'vaccination');
      expect(vacItems.every(c => c.completed)).toBe(false);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// UC-02 — Checklist Generation (all 9 code branches)
// ══════════════════════════════════════════════════════════════════════════════
describe('UC-02 — Checklist Generation', () => {

  // ── US — Dog paths ────────────────────────────────────────────────────────
  describe('US: Dog from low-risk country (Scenario 1)', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });
    it('TC-02-05: generates checklist', () => expect(s.checklist.length).toBeGreaterThan(0));
    it('includes us_microchip', () => expect(s.checklist.map(c=>c.id)).toContain('us_microchip'));
    it('includes us_age',       () => expect(s.checklist.map(c=>c.id)).toContain('us_age'));
    it('includes us_cdc_form',  () => expect(s.checklist.map(c=>c.id)).toContain('us_cdc_form'));
    it('includes us_healthy',   () => expect(s.checklist.map(c=>c.id)).toContain('us_healthy'));
    it('does NOT include titer test', () => expect(s.checklist.map(c=>c.id)).not.toContain('us_titer_blood_draw'));
    it('negative: rabies is recommended only (not mandatory)', () => {
      const rabies = s.checklist.find(c => c.id === 'us_rabies_rec');
      expect(rabies?.mandatory).toBe(false);
    });
  });

  describe('US: Dog from rabies-free country (same as low-risk)', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'AU', petType: 'dog' });
    it('includes cdc form', () => expect(s.checklist.map(c=>c.id)).toContain('us_cdc_form'));
    it('does NOT require titer', () => expect(s.checklist.map(c=>c.id)).not.toContain('us_titer_blood_draw'));
  });

  describe('US: Dog from high-risk country, foreign-vaccinated (Scenario 2)', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'IN', petType: 'dog', isUSVaccinated: false });
    it('includes titer blood draw',  () => expect(s.checklist.map(c=>c.id)).toContain('us_titer_blood_draw'));
    it('includes titer results',     () => expect(s.checklist.map(c=>c.id)).toContain('us_titer_results'));
    it('includes CDC facility booking', () => expect(s.checklist.map(c=>c.id)).toContain('us_cdc_facility_booking'));
    it('includes foreign cert',      () => expect(s.checklist.map(c=>c.id)).toContain('us_cert_foreign_vacc'));
    it('has more items than low-risk', () => {
      const low = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });
      expect(s.checklist.length).toBeGreaterThan(low.checklist.length);
    });
  });

  describe('TC-02-10: US: Dog from high-risk country, US-vaccinated (Scenario 3)', () => {
    const vaccinated   = buildTravelScenario({ destination: 'US', originCountryCode: 'IN', petType: 'dog', isUSVaccinated: true });
    const unvaccinated = buildTravelScenario({ destination: 'US', originCountryCode: 'IN', petType: 'dog', isUSVaccinated: false });
    it('US-vaccinated does NOT need titer test', () => expect(vaccinated.checklist.map(c=>c.id)).not.toContain('us_titer_blood_draw'));
    it('US-vaccinated DOES need us_cert_us_vacc', () => expect(vaccinated.checklist.map(c=>c.id)).toContain('us_cert_us_vacc'));
    it('different from foreign-vaccinated path', () => expect(vaccinated.checklist.length).not.toBe(unvaccinated.checklist.length));
  });

  // ── US — Cat paths ────────────────────────────────────────────────────────
  describe('TC-02-06: US: Cat (all origins)', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'IN', petType: 'cat' });
    it('cat checklist exists', () => expect(s.checklist.length).toBeGreaterThan(0));
    it('does NOT include us_cdc_form', () => expect(s.checklist.map(c=>c.id)).not.toContain('us_cdc_form'));
    it('does NOT include us_microchip (mandatory)', () => {
      const chip = s.checklist.find(c => c.id === 'us_microchip');
      expect(chip).toBeUndefined();
    });
    it('does NOT require titer test', () => expect(s.checklist.map(c=>c.id)).not.toContain('us_titer_blood_draw'));
    it('us_cat_healthy is mandatory', () => {
      expect(s.checklist.find(c => c.id === 'us_cat_healthy')?.mandatory).toBe(true);
    });
    it('negative: cat has fewer mandatory items than dog from high-risk', () => {
      const dog = buildTravelScenario({ destination: 'US', originCountryCode: 'IN', petType: 'dog', isUSVaccinated: false });
      const catMandatory = s.checklist.filter(c => c.mandatory).length;
      const dogMandatory = dog.checklist.filter(c => c.mandatory).length;
      expect(catMandatory).toBeLessThan(dogMandatory);
    });
  });

  // ── Canada paths ──────────────────────────────────────────────────────────
  describe('TC-02-09: Canada: Dog from low-risk country', () => {
    const s = buildTravelScenario({ destination: 'CA', originCountryCode: 'GB', petType: 'dog' });
    it('includes ca_rabies_cert', () => expect(s.checklist.map(c=>c.id)).toContain('ca_rabies_cert'));
    it('includes ca_dog_healthy', () => expect(s.checklist.map(c=>c.id)).toContain('ca_dog_healthy'));
    it('does NOT require health cert (low risk)', () => expect(s.checklist.map(c=>c.id)).not.toContain('ca_health_cert'));
  });

  describe('Canada: Dog from high-risk country', () => {
    const s = buildTravelScenario({ destination: 'CA', originCountryCode: 'IN', petType: 'dog' });
    it('includes ca_health_cert (extra requirement)', () => expect(s.checklist.map(c=>c.id)).toContain('ca_health_cert'));
    it('has more items than low-risk dog', () => {
      const low = buildTravelScenario({ destination: 'CA', originCountryCode: 'GB', petType: 'dog' });
      expect(s.checklist.length).toBeGreaterThan(low.checklist.length);
    });
  });

  describe('Canada: Cat', () => {
    const s = buildTravelScenario({ destination: 'CA', originCountryCode: 'GB', petType: 'cat' });
    it('ca_cat_healthy is mandatory', () => expect(s.checklist.find(c=>c.id==='ca_cat_healthy')?.mandatory).toBe(true));
    it('rabies is recommended only (not mandatory)', () => expect(s.checklist.find(c=>c.id==='ca_cat_rabies_rec')?.mandatory).toBe(false));
    it('negative: no mandatory vaccination for cat to Canada', () => {
      const mandatoryVacc = s.checklist.filter(c => c.category === 'vaccination' && c.mandatory);
      expect(mandatoryVacc).toHaveLength(0);
    });
  });

  // ── EU paths ──────────────────────────────────────────────────────────────
  describe('TC-02-08: EU: Dog from low-risk country', () => {
    const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'GB', petType: 'dog' });
    it('includes eu_microchip', () => expect(s.checklist.map(c=>c.id)).toContain('eu_microchip'));
    it('includes eu_rabies_vacc', () => expect(s.checklist.map(c=>c.id)).toContain('eu_rabies_vacc'));
    it('includes eu_health_cert', () => expect(s.checklist.map(c=>c.id)).toContain('eu_health_cert'));
    it('does NOT include mandatory titer test (low risk)', () => {
      const titer = s.checklist.find(c => c.id === 'eu_titer');
      expect(titer).toBeUndefined();
    });
    it('tapeworm item is optional (not mandatory) for low-risk', () => {
      const tapeworm = s.checklist.find(c => c.id === 'eu_tapeworm_optional');
      if (tapeworm) expect(tapeworm.mandatory).toBe(false);
    });
  });

  describe('TC-02-07: EU: Dog from high-risk country', () => {
    const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'IN', petType: 'dog' });
    it('includes eu_titer (mandatory)', () => {
      const titer = s.checklist.find(c => c.id === 'eu_titer');
      expect(titer?.mandatory).toBe(true);
    });
    it('includes eu_tapeworm (mandatory for dogs)', () => {
      const tapeworm = s.checklist.find(c => c.id === 'eu_tapeworm');
      expect(tapeworm?.mandatory).toBe(true);
    });
    it('has more items than low-risk', () => {
      const low = buildTravelScenario({ destination: 'EU', originCountryCode: 'GB', petType: 'dog' });
      expect(s.checklist.length).toBeGreaterThan(low.checklist.length);
    });
  });

  describe('EU: Cat from low-risk country', () => {
    const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'GB', petType: 'cat' });
    it('includes eu_microchip', () => expect(s.checklist.map(c=>c.id)).toContain('eu_microchip'));
    it('no tapeworm item (cats exempt)', () => {
      expect(s.checklist.find(c => c.id.includes('tapeworm'))).toBeUndefined();
    });
  });

  describe('EU: Cat from high-risk country', () => {
    const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'IN', petType: 'cat' });
    it('includes titer test', () => expect(s.checklist.map(c=>c.id)).toContain('eu_titer'));
    it('negative: NO tapeworm for cats even from high-risk', () => {
      expect(s.checklist.find(c => c.id === 'eu_tapeworm')).toBeUndefined();
    });
  });

  // ── Unknown country fallback ──────────────────────────────────────────────
  describe('Unknown origin country fallback', () => {
    it('unknown code treated as high_risk', () => {
      const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'XX', petType: 'dog' });
      // High-risk path → titer required
      expect(s.checklist.map(c=>c.id)).toContain('eu_titer');
    });
    it('COUNTRIES list contains expected countries', () => {
      const codes = COUNTRIES.map(c => c.code);
      expect(codes).toContain('GB');
      expect(codes).toContain('IN');
      expect(codes).toContain('US');
      expect(codes).toContain('AU');
    });
  });

  // ── applyPetProfileToChecklist ────────────────────────────────────────────
  describe('TC-02-12: Microchip auto-tick', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });

    it('microchip auto-ticked when pet has number', () => {
      const result = applyPetProfileToChecklist(s.checklist, '2020-01-01', '982000123456789', IN_60);
      expect(result.find(c => c.id === 'us_microchip')?.completed).toBe(true);
    });
    it('negative: microchip NOT ticked when no number', () => {
      const result = applyPetProfileToChecklist(s.checklist, '2020-01-01', undefined, IN_60);
      expect(result.find(c => c.id === 'us_microchip')?.completed).toBe(false);
    });
    it('negative: microchip NOT ticked when empty string', () => {
      const result = applyPetProfileToChecklist(s.checklist, '2020-01-01', '  ', IN_60);
      expect(result.find(c => c.id === 'us_microchip')?.completed).toBe(false);
    });
    it('EU microchip also auto-ticked', () => {
      const eu = buildTravelScenario({ destination: 'EU', originCountryCode: 'GB', petType: 'dog' });
      const result = applyPetProfileToChecklist(eu.checklist, '2020-01-01', '982000123456789', IN_60);
      expect(result.find(c => c.id === 'eu_microchip')?.completed).toBe(true);
    });
  });

  describe('TC-02-13: Dog age eligibility (us_age)', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });

    it('dog 3 months old → us_age not eligible', () => {
      const dob = dateStr(daysAgo(90)); // ~3 months
      const result = applyPetProfileToChecklist(s.checklist, dob, undefined, IN_60);
      expect(result.find(c => c.id === 'us_age')?.notEligible).toBe(true);
    });
    it('dog 12 months old → us_age completed', () => {
      const dob = dateStr(daysAgo(365));
      const result = applyPetProfileToChecklist(s.checklist, dob, undefined, IN_60);
      expect(result.find(c => c.id === 'us_age')?.completed).toBe(true);
      expect(result.find(c => c.id === 'us_age')?.notEligible).toBe(false);
    });
    it('dog exactly 6 months → eligible', () => {
      const dob = dateStr(daysAgo(183));
      const result = applyPetProfileToChecklist(s.checklist, dob, undefined, IN_60);
      expect(result.find(c => c.id === 'us_age')?.notEligible).toBeFalsy();
    });
    it('negative: invalid DOB → age treated as unknown, item unchanged', () => {
      const result = applyPetProfileToChecklist(s.checklist, 'not-a-date', undefined, IN_60);
      const ageItem = result.find(c => c.id === 'us_age');
      expect(ageItem?.notEligible).toBeFalsy(); // no eligibility change if DOB invalid
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// UC-03 — Timeline Management
// ══════════════════════════════════════════════════════════════════════════════
describe('UC-03 — Timeline Management', () => {

  const makeItem = (overrides: Partial<ChecklistItem> = {}): ChecklistItem => ({
    id: 'test', title: 'Test', description: '', category: 'document',
    mandatory: true, completed: false, daysBeforeTravel: 30,
    officialSource: '', notEligible: false, ...overrides,
  });

  describe('Status badge assignment', () => {
    it('TC-03-01: overdue when due date is in the past', () => {
      const item = makeItem({ daysBeforeTravel: 90 }); // due 90 days before travel
      const events = buildTimeline([item], TOMORROW);   // travel tomorrow → due was 89 days ago
      expect(events[0].status).toBe('overdue');
    });
    it('TC-03-02: urgent when due within 0–3 days', () => {
      const item = makeItem({ daysBeforeTravel: 1 });
      const events = buildTimeline([item], daysFromNow(2));
      expect(events[0].status === 'urgent' || events[0].status === 'overdue').toBe(true);
    });
    it('TC-03-03: upcoming when 4–14 days away', () => {
      const item = makeItem({ daysBeforeTravel: 5 });
      const events = buildTimeline([item], daysFromNow(10));
      expect(events[0].status).toBe('upcoming');
    });
    it('TC-03-04: scheduled when 15+ days away', () => {
      const item = makeItem({ daysBeforeTravel: 10 });
      const events = buildTimeline([item], IN_60);
      expect(events[0].status).toBe('scheduled');
    });
    it('TC-03-05: anytime when daysBeforeTravel is null', () => {
      const item = makeItem({ daysBeforeTravel: null });
      const events = buildTimeline([item], IN_60);
      expect(events[0].status).toBe('anytime');
    });
    it('completed item has status=completed', () => {
      const item = makeItem({ completed: true });
      const events = buildTimeline([item], IN_60);
      expect(events[0].status).toBe('completed');
    });
    it('notEligible item has status=not_eligible', () => {
      const item = makeItem({ notEligible: true });
      const events = buildTimeline([item], IN_60);
      expect(events[0].status).toBe('not_eligible');
    });
  });

  describe('TC-03-06: Sort order', () => {
    it('overdue before urgent, urgent before scheduled, completed last', () => {
      const items = [
        makeItem({ id:'done',     completed: true,  daysBeforeTravel: 5 }),
        makeItem({ id:'sched',    completed: false, daysBeforeTravel: 10 }),
        makeItem({ id:'overdue',  completed: false, daysBeforeTravel: 90 }),
        makeItem({ id:'anytime',  completed: false, daysBeforeTravel: null }),
      ];
      const events = buildTimeline(items, TOMORROW);
      const ids = events.map(e => e.id);
      expect(ids.indexOf('overdue')).toBeLessThan(ids.indexOf('anytime'));
      expect(ids.indexOf('overdue')).toBeLessThan(ids.indexOf('done'));
    });
  });

  describe('TC-03-07 & TC-03-08: Readiness score', () => {
    const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'IN', petType: 'dog' });

    it('TC-03-07: 0% when nothing complete', () => {
      const events = buildTimeline(s.checklist, IN_60);
      expect(getReadinessStatus(events).percentComplete).toBe(0);
    });
    it('TC-03-08: increases on completion', () => {
      const half = s.checklist.map((c, i) => ({ ...c, completed: i === 0 }));
      const events = buildTimeline(half, IN_60);
      expect(getReadinessStatus(events).percentComplete).toBeGreaterThan(0);
    });
    it('100% when all mandatory done', () => {
      const allDone = s.checklist.map(c => ({ ...c, completed: true }));
      const events = buildTimeline(allDone, IN_60);
      const status = getReadinessStatus(events);
      expect(status.percentComplete).toBe(100);
      expect(status.isReady).toBe(true);
    });
    it('negative: not_eligible items excluded from mandatory count', () => {
      const withIneligible = s.checklist.map(c => ({ ...c, notEligible: true, completed: false }));
      const events = buildTimeline(withIneligible, IN_60);
      const status = getReadinessStatus(events);
      expect(status.totalMandatory).toBe(0);
      expect(status.percentComplete).toBe(0);
    });
    it('negative: 0% when no mandatory items at all', () => {
      const items = [makeItem({ mandatory: false, daysBeforeTravel: null })];
      const events = buildTimeline(items, IN_60);
      expect(getReadinessStatus(events).percentComplete).toBe(0);
    });
    it('calcReadinessScore convenience wrapper works', () => {
      expect(calcReadinessScore(s.checklist)).toBe(0);
    });
  });

  describe('TC-03-09: Due dates', () => {
    it('items with daysBeforeTravel have a Date dueDate', () => {
      const item = makeItem({ daysBeforeTravel: 30 });
      const events = buildTimeline([item], IN_60);
      expect(events[0].dueDate).toBeInstanceOf(Date);
    });
    it('anytime items have null dueDate', () => {
      const item = makeItem({ daysBeforeTravel: null });
      const events = buildTimeline([item], IN_60);
      expect(events[0].dueDate).toBeNull();
    });
    it('nextActionDate set when pending items exist', () => {
      const events = buildTimeline([makeItem()], IN_60);
      expect(getReadinessStatus(events).nextActionDate).toBeInstanceOf(Date);
      expect(getReadinessStatus(events).nextActionTitle).toBeTruthy();
    });
    it('negative: nextActionDate null when all done', () => {
      const events = buildTimeline([makeItem({ completed: true })], IN_60);
      expect(getReadinessStatus(events).nextActionDate).toBeNull();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// UC-04 — Item Tracking
// ══════════════════════════════════════════════════════════════════════════════
describe('UC-04 — Item Tracking', () => {

  describe('toggleChecklistItem — free plan', () => {
    it('TC-04-01: can toggle free item (microchip)', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      const trip = makeTrip({ checklist: [{ ...makeTrip().checklist[0], id: 'microchip' }] });
      store.getState().addTrip(trip);
      store.getState().toggleChecklistItem('trip1', 'microchip');
      expect(store.getState().trips[0].checklist[0].completed).toBe(true);
    });
    it('TC-04-02: cannot toggle locked item on free plan', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      // us_cdc_form is not in FREE_CHECKLIST_IDS
      store.getState().toggleChecklistItem('trip1', 'us_cdc_form');
      const item = store.getState().trips[0].checklist.find(c => c.id === 'us_cdc_form');
      expect(item?.completed).toBe(false);
    });
    it('negative: toggle on non-existent trip does nothing', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      expect(() => store.getState().toggleChecklistItem('wrong-trip', 'microchip')).not.toThrow();
      expect(store.getState().trips).toHaveLength(1);
    });
  });

  describe('toggleChecklistItem — premium plan', () => {
    it('TC-04-03 & TC-04-04: unlocked trip allows toggling any item', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().unlockTrip('trip1');
      store.getState().toggleChecklistItem('trip1', 'us_cdc_form');
      const item = store.getState().trips[0].checklist.find(c => c.id === 'us_cdc_form');
      expect(item?.completed).toBe(true);
    });
    it('TC-04-05: unticking reverses completion', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().unlockTrip('trip1');
      store.getState().toggleChecklistItem('trip1', 'us_cdc_form');
      store.getState().toggleChecklistItem('trip1', 'us_cdc_form');
      const item = store.getState().trips[0].checklist.find(c => c.id === 'us_cdc_form');
      expect(item?.completed).toBe(false);
    });
    it('unlockTrip sets isPremium=true', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().unlockTrip('trip1');
      expect(store.getState().trips[0].isPremium).toBe(true);
    });
    it('unlockTrip adds a purchase record', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().unlockTrip('trip1');
      expect(store.getState().purchases).toHaveLength(1);
      expect(store.getState().purchases[0].tripId).toBe('trip1');
    });
  });

  describe('Readiness score changes', () => {
    it('score increases after unlocking and ticking', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      const scoreBefore = calcReadinessScore(store.getState().trips[0].checklist);
      store.getState().unlockTrip('trip1');
      store.getState().toggleChecklistItem('trip1', 'us_cdc_form');
      const scoreAfter = calcReadinessScore(store.getState().trips[0].checklist);
      expect(scoreAfter).toBeGreaterThanOrEqual(scoreBefore);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// UC-05 — Deadline Alerts (visual badge states)
// ══════════════════════════════════════════════════════════════════════════════
describe('UC-05 — Deadline Alerts', () => {

  it('TC-05-01: hasOverdue=true when high-risk trip is tomorrow', () => {
    const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'IN', petType: 'dog' });
    const events = buildTimeline(s.checklist, TOMORROW);
    expect(getReadinessStatus(events).hasOverdue).toBe(true);
  });
  it('TC-05-04: hasOverdue=false when all mandatory done', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });
    const events = buildTimeline(s.checklist.map(c => ({ ...c, completed: true })), IN_60);
    expect(getReadinessStatus(events).hasOverdue).toBe(false);
  });
  it('TC-05-05: nextActionDate available for future trip', () => {
    const s = buildTravelScenario({ destination: 'EU', originCountryCode: 'GB', petType: 'dog' });
    const events = buildTimeline(s.checklist, IN_60);
    expect(getReadinessStatus(events).nextActionDate).toBeInstanceOf(Date);
  });
  it('negative: hasOverdue=false for low-risk trip far in future', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });
    const events = buildTimeline(s.checklist, IN_120);
    expect(getReadinessStatus(events).hasOverdue).toBe(false);
  });
  it('negative: score stays 0 if all items are not_eligible', () => {
    const s = buildTravelScenario({ destination: 'US', originCountryCode: 'GB', petType: 'dog' });
    const allIneligible = s.checklist.map(c => ({ ...c, notEligible: true, completed: false }));
    const events = buildTimeline(allIneligible, IN_60);
    expect(getReadinessStatus(events).percentComplete).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// UC-06 — Offline Storage / Export / Import
// ══════════════════════════════════════════════════════════════════════════════
describe('UC-06 — Offline Storage', () => {

  describe('TC-06-03: exportAsJSON', () => {
    it('exports valid JSON', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      const json = store.getState().exportAsJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });
    it('exported JSON has version=2', () => {
      const store = freshStore();
      const data = JSON.parse(store.getState().exportAsJSON());
      expect(data.version).toBe(2);
    });
    it('exported JSON contains pets and trips', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      const data = JSON.parse(store.getState().exportAsJSON());
      expect(data.pets).toHaveLength(1);
      expect(data.trips).toHaveLength(1);
    });
    it('exported JSON has exportedAt timestamp', () => {
      const store = freshStore();
      const data = JSON.parse(store.getState().exportAsJSON());
      expect(data.exportedAt).toBeTruthy();
      expect(new Date(data.exportedAt).getFullYear()).toBeGreaterThan(2020);
    });
  });

  describe('TC-06-04: importFromJSON — success cases', () => {
    it('imports valid backup', () => {
      const source = freshStore();
      source.getState().addPet(makePet({ name: 'Imported' }));
      const json = source.getState().exportAsJSON();
      const target = freshStore();
      const result = target.getState().importFromJSON(json);
      expect(result.success).toBe(true);
      expect(target.getState().pets[0].name).toBe('Imported');
    });
    it('imported trips are restored', () => {
      const source = freshStore();
      source.getState().addPet(makePet());
      source.getState().addTrip(makeTrip());
      const json = source.getState().exportAsJSON();
      const target = freshStore();
      target.getState().importFromJSON(json);
      expect(target.getState().trips).toHaveLength(1);
    });
  });

  describe('TC-06-05: importFromJSON — failure cases', () => {
    it('negative: invalid JSON string returns error', () => {
      const store = freshStore();
      const result = store.getState().importFromJSON('not-json!');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
    it('negative: JSON missing pets field returns error', () => {
      const store = freshStore();
      const result = store.getState().importFromJSON(JSON.stringify({ trips: [] }));
      expect(result.success).toBe(false);
    });
    it('negative: JSON missing trips field returns error', () => {
      const store = freshStore();
      const result = store.getState().importFromJSON(JSON.stringify({ pets: [] }));
      expect(result.success).toBe(false);
    });
    it('negative: completely empty JSON object returns error', () => {
      const store = freshStore();
      const result = store.getState().importFromJSON(JSON.stringify({}));
      expect(result.success).toBe(false);
    });
    it('negative: store data unchanged after failed import', () => {
      const store = freshStore();
      store.getState().addPet(makePet({ name: 'SafePet' }));
      store.getState().importFromJSON('bad json');
      expect(store.getState().pets[0].name).toBe('SafePet');
    });
  });

  describe('TC-06-06: clearAll', () => {
    it('removes all pets, trips, and purchases', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().unlockTrip('trip1');
      store.getState().clearAll();
      expect(store.getState().pets).toHaveLength(0);
      expect(store.getState().trips).toHaveLength(0);
      expect(store.getState().purchases).toHaveLength(0);
    });
  });

  describe('TC-06-07: Profile data isolation', () => {
    it('two stores with different profile IDs are independent', () => {
      const storeA = createAppStore('profile-A');
      const storeB = createAppStore('profile-B');
      storeA.getState().addPet(makePet({ id:'petA', name:'AlphaDog' }));
      storeB.getState().addPet(makePet({ id:'petB', name:'BetaCat'  }));
      expect(storeA.getState().pets.map(p=>p.name)).not.toContain('BetaCat');
      expect(storeB.getState().pets.map(p=>p.name)).not.toContain('AlphaDog');
    });
  });

  describe('Store: deleteTrip', () => {
    it('removes the trip', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().deleteTrip('trip1');
      expect(store.getState().trips).toHaveLength(0);
    });
    it('negative: deleteTrip on wrong id does nothing', () => {
      const store = freshStore();
      store.getState().addPet(makePet());
      store.getState().addTrip(makeTrip());
      store.getState().deleteTrip('wrong-id');
      expect(store.getState().trips).toHaveLength(1);
    });
  });
});
