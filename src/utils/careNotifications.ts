import type { CareSchedule } from '../store/appStore';
import { activeMedicines, todayISO } from './careTime';

// ── Permission state ──────────────────────────────────────────────────────────
export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function getPermission(): NotifPermission {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission as NotifPermission;
}

export async function requestPermission(): Promise<NotifPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result as NotifPermission;
  } catch {
    return 'denied';
  }
}

// ── Native (Capacitor) detection — optional, no hard dep ──────────────────────
interface CapacitorWindow {
  Capacitor?: { isNativePlatform?: () => boolean };
}
export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as CapacitorWindow).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

// ── Reminder timetable ────────────────────────────────────────────────────────
export interface CareReminder {
  petId: string;
  petName: string;
  label: string;
  time: string; // 'HH:mm'
}

export function buildRemindersForDate(
  schedules: CareSchedule[],
  pets: { id: string; name: string }[],
  isoDate: string,
): CareReminder[] {
  const reminders: CareReminder[] = [];
  for (const schedule of schedules) {
    const pet = pets.find(p => p.id === schedule.petId);
    if (!pet) continue;
    if (schedule.food.enabled) {
      for (const meal of schedule.food.meals) {
        reminders.push({ petId: pet.id, petName: pet.name, label: `🍽️ ${meal.portion || 'Meal'}`, time: meal.time });
      }
    }
    if (schedule.water.enabled) {
      for (const t of schedule.water.times) {
        reminders.push({ petId: pet.id, petName: pet.name, label: '💧 Water', time: t });
      }
    }
    if (schedule.activity.enabled) {
      for (const t of schedule.activity.reminderTimes) {
        reminders.push({ petId: pet.id, petName: pet.name, label: `🏃 Activity (${schedule.activity.targetMinutes} min)`, time: t });
      }
    }
    for (const med of activeMedicines(schedule, isoDate)) {
      for (const t of med.times) {
        reminders.push({ petId: pet.id, petName: pet.name, label: `💊 ${med.name || 'Medicine'} ${med.dose}`.trim(), time: t });
      }
    }
  }
  return reminders;
}

// ── Web scheduler (in-memory; cleared on tab close) ───────────────────────────
let timers: number[] = [];

function clearTimers() {
  for (const id of timers) window.clearTimeout(id);
  timers = [];
}

function showWebNotification(title: string, body: string) {
  if (getPermission() !== 'granted') return;
  try { new Notification(title, { body, icon: '/petroamid-web/logo.jpg' }); } catch { /* ignore */ }
}

interface NativeNotifPlugin {
  schedule: (opts: { notifications: Array<{
    id: number; title: string; body: string; schedule: { at: Date };
  }> }) => Promise<unknown>;
  requestPermissions?: () => Promise<{ display: string }>;
}

async function loadNativePlugin(): Promise<NativeNotifPlugin | null> {
  if (!isNative()) return null;
  try {
    // Lazy import so the package is optional in web builds
    const mod = (await import(/* @vite-ignore */ '@capacitor/local-notifications')) as { LocalNotifications: NativeNotifPlugin };
    return mod.LocalNotifications;
  } catch {
    return null;
  }
}

export async function scheduleRemindersForToday(reminders: CareReminder[]): Promise<void> {
  clearTimers();
  const native = await loadNativePlugin();
  if (native) {
    try {
      await native.requestPermissions?.();
      const today = todayISO();
      const notifications = reminders
        .map((r, i) => {
          const at = parseTimeToday(today, r.time);
          if (at.getTime() <= Date.now()) return null;
          return {
            id: i + 1,
            title: `${r.petName}`,
            body:  r.label,
            schedule: { at },
          };
        })
        .filter((n): n is NonNullable<typeof n> => n !== null);
      if (notifications.length > 0) await native.schedule({ notifications });
    } catch { /* ignore */ }
    return;
  }

  if (getPermission() !== 'granted') return;
  const today = todayISO();
  for (const r of reminders) {
    const at = parseTimeToday(today, r.time);
    const ms = at.getTime() - Date.now();
    if (ms <= 0 || ms > 24 * 3600 * 1000) continue;
    const id = window.setTimeout(() => {
      showWebNotification(r.petName, r.label);
    }, ms);
    timers.push(id);
  }
}

function parseTimeToday(isoDate: string, hhmm: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}
