// ─────────────────────────────────────────────────────────────────────────────
// PetRoam – Timeline Calculator (shared with RN — pure TS)
// ─────────────────────────────────────────────────────────────────────────────
import { addDays, subDays, differenceInDays, differenceInMonths, isAfter, isBefore, isToday } from 'date-fns';
import type { ChecklistItem } from '../data/travelRequirements';

export type TimelineStatus = 'overdue' | 'urgent' | 'upcoming' | 'scheduled' | 'completed' | 'anytime' | 'not_eligible';

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
  const today = new Date(); today.setHours(0,0,0,0);

  const events: TimelineEvent[] = items.map(item => {
    if (item.notEligible) {
      return { id: item.id, checklistItemId: item.id, title: item.title, description: item.description,
        dueDate: null, status: 'not_eligible', daysUntilDue: null, category: item.category,
        mandatory: item.mandatory, completed: false, officialSource: item.officialSource };
    }
    if (item.daysBeforeTravel === null) {
      return { id: item.id, checklistItemId: item.id, title: item.title, description: item.description,
        dueDate: null, status: item.completed ? 'completed' : 'anytime', daysUntilDue: null,
        category: item.category, mandatory: item.mandatory, completed: item.completed,
        officialSource: item.officialSource };
    }
    const dueDate = subDays(travelDate, item.daysBeforeTravel);
    dueDate.setHours(0,0,0,0);
    const daysUntilDue = differenceInDays(dueDate, today);
    let status: TimelineStatus;
    if (item.completed) status = 'completed';
    else if (isBefore(dueDate, today)) status = 'overdue';
    else if (isToday(dueDate) || daysUntilDue <= 3) status = 'urgent';
    else if (daysUntilDue <= 14) status = 'upcoming';
    else status = 'scheduled';
    return { id: item.id, checklistItemId: item.id, title: item.title, description: item.description,
      dueDate, status, daysUntilDue, category: item.category, mandatory: item.mandatory,
      completed: item.completed, officialSource: item.officialSource };
  });

  return events.sort((a, b) => {
    const order: Record<TimelineStatus, number> = {
      overdue: 0, urgent: 1, upcoming: 2, scheduled: 3, anytime: 4, not_eligible: 5, completed: 6,
    };
    return order[a.status] - order[b.status];
  });
}

export function applyPetProfileToChecklist(
  checklist: ChecklistItem[],
  dateOfBirth: string,
  microchipNumber: string | undefined,
  travelDate: Date,
): ChecklistItem[] {
  const today = new Date(); today.setHours(0,0,0,0);
  const ageInMonths = differenceInMonths(travelDate, new Date(dateOfBirth));
  const hasMicrochip = !!microchipNumber?.trim();

  return checklist.map(item => {
    if (item.category === 'microchip') return { ...item, completed: hasMicrochip };
    if (item.id.includes('age') || item.id.includes('us_age')) {
      return { ...item, notEligible: ageInMonths < 6 };
    }
    return item;
  });
}

export function calcReadinessScore(items: ChecklistItem[]): number {
  const eligible = items.filter(i => !i.notEligible);
  const mandatory = eligible.filter(i => i.mandatory);
  if (!mandatory.length) return eligible.length ? Math.round((eligible.filter(i => i.completed).length / eligible.length) * 100) : 0;
  const done = mandatory.filter(i => i.completed).length;
  return Math.round((done / mandatory.length) * 100);
}
