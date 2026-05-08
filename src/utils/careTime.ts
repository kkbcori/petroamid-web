import type {
  CareSchedule, DailyLog, Medicine,
} from '../store/appStore';

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function expandMedicineTimes(med: Medicine): string[] {
  if (med.times.length > 0) return med.times;
  switch (med.frequency) {
    case 'once':   return ['09:00'];
    case 'twice':  return ['09:00', '21:00'];
    case 'three':  return ['08:00', '14:00', '20:00'];
    case 'custom': {
      const interval = Math.max(1, med.intervalHours ?? 12);
      const times: string[] = [];
      let h = 8;
      while (h < 24) {
        times.push(`${String(h).padStart(2, '0')}:00`);
        h += interval;
      }
      return times.length ? times : ['09:00'];
    }
  }
}

export function isMedicineActiveOn(med: Medicine, isoDate: string): boolean {
  const date = parseISODate(isoDate).getTime();
  const start = parseISODate(med.startDate).getTime();
  if (date < start) return false;
  if (med.endDate) {
    const end = parseISODate(med.endDate).getTime();
    if (date > end) return false;
  }
  return true;
}

export function activeMedicines(schedule: CareSchedule, isoDate: string): Medicine[] {
  return schedule.medicine.filter(m => isMedicineActiveOn(m, isoDate));
}

// ── Completion ratio for a single pet on a single day ─────────────────────────
export interface DayCompletion {
  done: number;
  total: number;
  ratio: number;
}

export function dayCompletion(schedule: CareSchedule, log: DailyLog): DayCompletion {
  let done = 0;
  let total = 0;

  if (schedule.food.enabled && schedule.food.meals.length > 0) {
    total += schedule.food.meals.length;
    done  += log.food.filter(Boolean).length;
  }
  if (schedule.water.enabled && schedule.water.times.length > 0) {
    total += schedule.water.times.length;
    done  += log.water.filter(Boolean).length;
  }
  if (schedule.activity.enabled) {
    total += 1;
    if (log.activity.completed || log.activity.minutesLogged >= schedule.activity.targetMinutes) done += 1;
  }
  for (const med of activeMedicines(schedule, log.date)) {
    const times = med.times.length > 0 ? med.times : [''];
    for (const t of times) {
      total += 1;
      const key = `${med.id}@${t}`;
      if (log.medicine[key]) done += 1;
    }
  }
  if (schedule.grooming.enabled) {
    total += 1;
    if (log.grooming) done += 1;
  }
  if (schedule.vet.enabled) {
    total += 1;
    if (log.vet) done += 1;
  }

  const ratio = total === 0 ? 0 : done / total;
  return { done, total, ratio };
}

export type DayStatus = 'green' | 'yellow' | 'red' | 'grey';

export function dayStatus(c: DayCompletion, isPast: boolean, isFuture: boolean): DayStatus {
  if (isFuture) return 'grey';
  if (c.total === 0) return 'grey';
  if (c.done >= c.total) return 'green';
  if (c.done === 0 && isPast) return 'red';
  return isPast ? 'red' : 'yellow';
}

export function calcVetNextDue(lastVisit: string | undefined, intervalMonths: number): string | undefined {
  if (!lastVisit) return undefined;
  return todayISO(addMonths(parseISODate(lastVisit), intervalMonths));
}

export function nowHHMM(d: Date = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
