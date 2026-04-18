// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Timeline Calculator  (identical logic to RN app)
// ─────────────────────────────────────────────────────────────────────────────
import { subDays, differenceInDays, differenceInMonths, isToday, isBefore } from 'date-fns';
import type { ChecklistItem } from '../data/travelRequirements';

export type TimelineStatus =
  | 'overdue' | 'urgent' | 'upcoming' | 'scheduled'
  | 'completed' | 'anytime' | 'not_eligible';

export interface TimelineEvent {
  id: string;
  checklistItemId: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: TimelineStatus;
  daysUntilDue: number | null;
  category: ChecklistItem['category'];
  mandatory: boolean;
  completed: boolean;
  officialSource: string;
}

export function buildTimeline(items: ChecklistItem[], travelDate: Date): TimelineEvent[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const events: TimelineEvent[] = items.map(item => {
    if (item.notEligible) {
      return {
        id: item.id, checklistItemId: item.id, title: item.title,
        description: item.description, dueDate: null,
        status: 'not_eligible' as TimelineStatus, daysUntilDue: null,
        category: item.category, mandatory: item.mandatory,
        completed: false, officialSource: item.officialSource,
      };
    }

    if (item.daysBeforeTravel === null) {
      return {
        id: item.id, checklistItemId: item.id, title: item.title,
        description: item.description, dueDate: null,
        status: item.completed ? 'completed' : 'anytime' as TimelineStatus,
        daysUntilDue: null, category: item.category,
        mandatory: item.mandatory, completed: item.completed,
        officialSource: item.officialSource,
      };
    }

    const dueDate = subDays(travelDate, item.daysBeforeTravel);
    dueDate.setHours(0, 0, 0, 0);
    const daysUntilDue = differenceInDays(dueDate, today);

    let status: TimelineStatus;
    if (item.completed)                          status = 'completed';
    else if (isBefore(dueDate, today))           status = 'overdue';
    else if (isToday(dueDate) || daysUntilDue <= 3) status = 'urgent';
    else if (daysUntilDue <= 14)                 status = 'upcoming';
    else                                         status = 'scheduled';

    return {
      id: item.id, checklistItemId: item.id, title: item.title,
      description: item.description, dueDate, status, daysUntilDue,
      category: item.category, mandatory: item.mandatory,
      completed: item.completed, officialSource: item.officialSource,
    };
  });

  const order: Record<TimelineStatus, number> = {
    overdue: 0, urgent: 1, upcoming: 2, scheduled: 3,
    anytime: 4, not_eligible: 5, completed: 6,
  };
  return events.sort((a, b) => order[a.status] - order[b.status]);
}

// ── Readiness — identical to original getReadinessStatus ─────────────────────
export function getReadinessStatus(events: TimelineEvent[]): {
  isReady: boolean;
  totalMandatory: number;
  completedMandatory: number;
  percentComplete: number;
  hasOverdue: boolean;
  nextActionDate: Date | null;
  nextActionTitle: string | null;
} {
  const mandatory          = events.filter(e => e.mandatory && !e.notEligible);
  const completedMandatory = mandatory.filter(e => e.completed);
  const hasOverdue         = mandatory.some(e => e.status === 'overdue');
  const percentComplete    = mandatory.length > 0
    ? Math.round((completedMandatory.length / mandatory.length) * 100)
    : 0;
  const isReady = mandatory.every(e => e.completed);
  const nextPending = events
    .filter(e => !e.completed && e.dueDate !== null)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0];

  return {
    isReady,
    totalMandatory:      mandatory.length,
    completedMandatory:  completedMandatory.length,
    percentComplete,
    hasOverdue,
    nextActionDate:  nextPending?.dueDate  ?? null,
    nextActionTitle: nextPending?.title    ?? null,
  };
}

// Convenience wrapper used by Dashboard/ChecklistPage score badge
export function calcReadinessScore(items: ChecklistItem[]): number {
  const events = buildTimeline(items, new Date(Date.now() + 86400000)); // dummy future date
  return getReadinessStatus(events).percentComplete;
}

// ── applyPetProfileToChecklist — identical IDs to original ───────────────────
// Original uses specific item IDs, NOT category names
const MICROCHIP_IDS  = ['us_microchip', 'eu_microchip', 'ca_microchip'];
const US_AGE_ID      = 'us_age';
const MIN_AGE_MONTHS = 6;

export function applyPetProfileToChecklist(
  checklist: ChecklistItem[],
  petDob: string,
  microchipNumber: string | undefined,
  travelDate: Date,
): ChecklistItem[] {
  const dobDate  = new Date(petDob);
  const ageMonths = isNaN(dobDate.getTime())
    ? null
    : differenceInMonths(travelDate, dobDate);

  return checklist.map(item => {
    // Microchip: auto-complete if number saved in profile
    if (MICROCHIP_IDS.includes(item.id) && microchipNumber?.trim()) {
      return { ...item, completed: true, notEligible: false };
    }
    // US age requirement (6 months minimum)
    if (item.id === US_AGE_ID && ageMonths !== null) {
      if (ageMonths >= MIN_AGE_MONTHS) {
        return { ...item, completed: true,  notEligible: false };
      } else {
        return { ...item, completed: false, notEligible: true  };
      }
    }
    return { ...item, completed: item.completed ?? false };
  });
}
