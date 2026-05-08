import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import type {
  ActivitySession, ActivityType, CareSchedule, DailyLog, Medicine, Pet,
} from '../store/appStore';
import {
  activeMedicines, addDays, dayCompletion, dayStatus, parseISODate, todayISO, nowHHMM,
} from '../utils/careTime';
import {
  buildRemindersForDate, getPermission, requestPermission, scheduleRemindersForToday,
  type NotifPermission,
} from '../utils/careNotifications';
import { format } from 'date-fns';

type ViewMode = 'list' | 'calendar';

export default function CarePage() {
  const navigate = useNavigate();
  const data = useData();
  const pets: Pet[] = data.pets;

  const [view, setView] = useState<ViewMode>('list');
  const [activePetId, setActivePetId] = useState<string>(pets[0]?.id ?? '');
  const [permission, setPermission] = useState<NotifPermission>(getPermission());

  useEffect(() => {
    if (!activePetId && pets[0]) setActivePetId(pets[0].id);
  }, [pets, activePetId]);

  // ── First visit: ask for permission, then schedule today's reminders ──────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let p = getPermission();
      if (p === 'default') {
        p = await requestPermission();
      }
      if (cancelled) return;
      setPermission(p);
      const schedules = pets
        .map(pet => data.getCareSchedule(pet.id))
        .filter((s): s is CareSchedule => Boolean(s));
      const reminders = buildRemindersForDate(schedules, pets.map(p => ({ id: p.id, name: p.name })), todayISO());
      await scheduleRemindersForToday(reminders);
    })();
    return () => { cancelled = true; };
    // intentionally only on mount + when pets list identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pets.length]);

  if (pets.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', background: Colors.navyMid, borderRadius: 18, border: `1px solid ${Colors.border}` }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Add a pet first</h2>
        <p style={{ color: Colors.creammid, marginBottom: 20 }}>Care schedules are configured per pet.</p>
        <button onClick={() => navigate('/pets/add')} style={primaryBtn}>+ Add Pet</button>
      </div>
    );
  }

  const activePet = pets.find(p => p.id === activePetId) ?? pets[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: Colors.cream }}>
            🐾 Care Tracker
          </div>
          <div style={{ fontSize: 13, color: Colors.creammid }}>
            Daily care for your pets
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 999, padding: 4 }}>
          <ToggleBtn active={view === 'list'}     onClick={() => setView('list')}>List</ToggleBtn>
          <ToggleBtn active={view === 'calendar'} onClick={() => setView('calendar')}>Calendar</ToggleBtn>
        </div>
      </div>

      {permission === 'denied' && (
        <div style={{ background: Colors.yellowBg, border: `1px solid ${Colors.yellow}`, color: Colors.cream, padding: '10px 14px', borderRadius: 12, marginBottom: 12, fontSize: 13 }}>
          🔔 Notifications are blocked. Enable them in your browser settings (site permissions) to receive care reminders.
        </div>
      )}

      {pets.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {pets.map(p => {
            const active = p.id === activePet.id;
            return (
              <button key={p.id} onClick={() => setActivePetId(p.id)} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer',
                border: `1px solid ${active ? '#8B5E00' : Colors.border}`,
                background: active ? '#8B5E00' : Colors.navyMid,
                color: active ? '#fff' : Colors.cream,
              }}>
                {p.avatarEmoji ?? '🐾'} {p.name}
              </button>
            );
          })}
        </div>
      )}

      {view === 'list'
        ? <DailyLogView pet={activePet} />
        : <CalendarView pet={activePet} />
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Log
// ─────────────────────────────────────────────────────────────────────────────
function DailyLogView({ pet }: { pet: Pet }) {
  const navigate = useNavigate();
  const data = useData();
  const today = todayISO();
  const schedule = data.getCareSchedule(pet.id);
  const log = data.getDailyLog(pet.id, today);

  const completion = dayCompletion(schedule, log);
  const meds = activeMedicines(schedule, today);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const isConfigured =
    schedule.food.enabled || schedule.water.enabled || schedule.activity.enabled ||
    schedule.medicine.length > 0 || schedule.grooming.enabled || schedule.vet.enabled;

  if (!isConfigured) {
    return (
      <div style={{ padding: 28, textAlign: 'center', background: Colors.navyMid, borderRadius: 18, border: `1px solid ${Colors.border}` }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>⚙️</div>
        <h2 style={{ fontSize: 18, marginBottom: 6 }}>No care schedule yet</h2>
        <p style={{ color: Colors.creammid, marginBottom: 16, fontSize: 14 }}>
          Configure {pet.name}'s daily routine to start tracking.
        </p>
        <button onClick={() => navigate(`/care/setup/${pet.id}`)} style={primaryBtn}>
          Configure schedule
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Top: completion ring + edit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <CompletionRing ratio={completion.ratio} done={completion.done} total={completion.total} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream }}>
            {format(new Date(), 'EEEE, MMM d')}
          </div>
          <div style={{ fontSize: 13, color: Colors.creammid }}>
            {completion.done}/{completion.total} tasks done
          </div>
        </div>
        <button onClick={() => navigate(`/care/setup/${pet.id}`)} style={editBtn}>Edit</button>
      </div>

      <CareItemList
        pet={pet}
        schedule={schedule}
        log={log}
        meds={meds}
        onLogActivity={() => setShowActivityModal(true)}
      />

      {showActivityModal && (
        <ActivityModal
          onClose={() => setShowActivityModal(false)}
          onSave={(session) => {
            data.logActivitySession(pet.id, today, session);
            setShowActivityModal(false);
          }}
        />
      )}
    </>
  );
}

function CareItemList({ pet, schedule, log, meds, onLogActivity }: {
  pet: Pet;
  schedule: CareSchedule;
  log: DailyLog;
  meds: Medicine[];
  onLogActivity: () => void;
}) {
  const data = useData();
  const today = log.date;

  type Item = {
    key: string;
    label: string;
    sub?: string;
    done: boolean;
    onToggle: () => void;
    extra?: React.ReactNode;
  };

  const items: Item[] = [];

  if (schedule.food.enabled) {
    schedule.food.meals.forEach((meal, i) => {
      items.push({
        key: `food-${i}`,
        label: `🍽️ Meal at ${meal.time}`,
        sub: meal.portion || undefined,
        done: log.food[i] ?? false,
        onToggle: () => data.toggleFoodSlot(pet.id, today, i),
      });
    });
  }
  if (schedule.water.enabled) {
    schedule.water.times.forEach((t, i) => {
      items.push({
        key: `water-${i}`,
        label: `💧 Water at ${t}`,
        done: log.water[i] ?? false,
        onToggle: () => data.toggleWaterSlot(pet.id, today, i),
      });
    });
  }
  if (schedule.activity.enabled) {
    items.push({
      key: 'activity',
      label: `🏃 Activity (target ${schedule.activity.targetMinutes} min)`,
      sub: `${log.activity.minutesLogged} min logged${log.activity.sessions.length ? ` · ${log.activity.sessions.length} session${log.activity.sessions.length > 1 ? 's' : ''}` : ''}`,
      done: log.activity.completed || log.activity.minutesLogged >= schedule.activity.targetMinutes,
      onToggle: () => data.updateDailyLog(pet.id, today, {
        activity: { ...log.activity, completed: !log.activity.completed },
      }),
      extra: (
        <button onClick={onLogActivity} style={smallBtn}>
          + Log Activity
        </button>
      ),
    });
  }
  for (const med of meds) {
    for (const t of med.times) {
      const slotKey = `${med.id}@${t}`;
      items.push({
        key: `med-${slotKey}`,
        label: `💊 ${med.name || 'Medicine'} ${med.dose}`.trim(),
        sub: `Time: ${t}`,
        done: log.medicine[slotKey] ?? false,
        onToggle: () => data.toggleMedicine(pet.id, today, slotKey),
      });
    }
  }
  if (schedule.grooming.enabled) {
    items.push({
      key: 'grooming',
      label: `✂️ Grooming`,
      sub: schedule.grooming.lastDone ? `Last: ${schedule.grooming.lastDone}` : undefined,
      done: log.grooming,
      onToggle: () => data.toggleLogItem(pet.id, today, 'grooming'),
    });
  }
  if (schedule.vet.enabled) {
    items.push({
      key: 'vet',
      label: `🏥 Vet visit`,
      sub: schedule.vet.nextDue ? `Next due: ${schedule.vet.nextDue}` : undefined,
      done: log.vet,
      onToggle: () => data.toggleLogItem(pet.id, today, 'vet'),
    });
  }

  // Pending first, completed last (strikethrough)
  const sorted = [...items].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div>
      {sorted.map(item => (
        <div key={item.key} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: Colors.navyMid, border: `1px solid ${Colors.border}`,
          borderRadius: 14, marginBottom: 8,
          opacity: item.done ? 0.7 : 1,
        }}>
          <button onClick={item.onToggle} style={{
            width: 28, height: 28, borderRadius: '50%',
            border: `2px solid ${item.done ? Colors.green : Colors.border}`,
            background: item.done ? Colors.green : 'transparent',
            color: '#fff', cursor: 'pointer', fontSize: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {item.done ? '✓' : ''}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: Colors.cream,
              textDecoration: item.done ? 'line-through' : 'none',
            }}>
              {item.label}
            </div>
            {item.sub && (
              <div style={{ fontSize: 12, color: Colors.creammid, marginTop: 2 }}>{item.sub}</div>
            )}
          </div>
          {item.extra}
        </div>
      ))}
    </div>
  );
}

function CompletionRing({ ratio, done, total }: { ratio: number; done: number; total: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.max(0, Math.min(1, ratio)) * circ;
  const color = ratio >= 1 ? Colors.green : ratio >= 0.5 ? Colors.gold : Colors.tealDark;
  const pct = total === 0 ? 0 : Math.round(ratio * 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke={Colors.border} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: Colors.cream }}>
        {pct}%
      </div>
      <span aria-hidden style={{ display: 'none' }}>{done}/{total}</span>
    </div>
  );
}

// ── Activity logging modal ────────────────────────────────────────────────────
function ActivityModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (session: ActivitySession) => void;
}) {
  const [type, setType] = useState<ActivityType>('Walk');
  const [minutes, setMinutes] = useState(20);
  const [note, setNote] = useState('');
  const [time, setTime] = useState(nowHHMM());

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalCard} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: Colors.cream }}>Log Activity</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ fontSize: 12, color: Colors.creammid, fontWeight: 600 }}>Type</label>
          <select value={type} onChange={e => setType(e.target.value as ActivityType)} style={modalInput}>
            <option value="Walk">Walk</option>
            <option value="Play">Play</option>
            <option value="Training">Training</option>
            <option value="Swim">Swim</option>
            <option value="Other">Other</option>
          </select>
          <label style={{ fontSize: 12, color: Colors.creammid, fontWeight: 600 }}>Duration (minutes)</label>
          <input type="number" min={1} value={minutes} onChange={e => setMinutes(Math.max(1, Number(e.target.value) || 0))} style={modalInput} />
          <label style={{ fontSize: 12, color: Colors.creammid, fontWeight: 600 }}>Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={modalInput} />
          <label style={{ fontSize: 12, color: Colors.creammid, fontWeight: 600 }}>Note (optional)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="How was it?" style={modalInput} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={() => onSave({ type, minutes, note, time })} style={primaryBtn}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar
// ─────────────────────────────────────────────────────────────────────────────
function CalendarView({ pet }: { pet: Pet }) {
  const data = useData();
  const today = new Date();
  const todayStr = todayISO(today);

  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const schedule = data.getCareSchedule(pet.id);

  // Build month grid
  const { days, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const startWeekday = first.getDay(); // 0=Sun
    const totalDays = last.getDate();

    const cells: Array<{ date: string | null; inMonth: boolean }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, inMonth: false });
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, month, d);
      cells.push({ date: todayISO(dt), inMonth: true });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, inMonth: false });
    return { days: cells, monthLabel: format(cursor, 'MMMM yyyy') };
  }, [cursor]);

  // Streak + month completion %
  const stats = useMemo(() => {
    let streak = 0;
    // walk back from yesterday (or today if all done) — count consecutive fully-complete days
    let cursorDate = new Date(today);
    // include today only if complete
    while (true) {
      const iso = todayISO(cursorDate);
      const log = data.getDailyLog(pet.id, iso);
      const c = dayCompletion(schedule, log);
      const isFuture = cursorDate.getTime() > today.getTime();
      if (isFuture) { cursorDate = addDays(cursorDate, -1); continue; }
      if (c.total > 0 && c.done >= c.total) {
        streak += 1;
        cursorDate = addDays(cursorDate, -1);
      } else {
        // if today is incomplete, the streak could still hold counting back from yesterday
        if (todayISO(cursorDate) === todayStr) {
          cursorDate = addDays(cursorDate, -1);
          continue;
        }
        break;
      }
      // safety
      if (streak > 365) break;
    }

    // Month completion %: days in month that are past or today AND fully complete
    let pastOrToday = 0;
    let fullyDone = 0;
    for (const cell of days) {
      if (!cell.date) continue;
      const d = parseISODate(cell.date);
      if (d.getTime() > today.getTime()) continue;
      if (d.getMonth() !== cursor.getMonth()) continue;
      pastOrToday += 1;
      const log = data.getDailyLog(pet.id, cell.date);
      const c = dayCompletion(schedule, log);
      if (c.total > 0 && c.done >= c.total) fullyDone += 1;
    }
    const monthPct = pastOrToday === 0 ? 0 : Math.round((fullyDone / pastOrToday) * 100);
    return { streak, monthPct };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.id, schedule, days, cursor]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: Colors.creammid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: Colors.cream }}>🔥 {stats.streak} day{stats.streak === 1 ? '' : 's'}</div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: Colors.border }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: Colors.creammid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>This month</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: Colors.cream }}>{stats.monthPct}%</div>
        </div>
      </div>

      <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={navArrow}>‹</button>
          <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream }}>{monthLabel}</div>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={navArrow}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ fontSize: 10, color: Colors.creammid, textAlign: 'center', fontWeight: 700 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map((cell, i) => {
            if (!cell.date) return <div key={i} />;
            const d = parseISODate(cell.date);
            const isFuture = d.getTime() > today.getTime();
            const isToday = cell.date === todayStr;
            const isPast = !isFuture && !isToday;
            const log = data.getDailyLog(pet.id, cell.date);
            const c = dayCompletion(schedule, log);
            const status = dayStatus(c, isPast, isFuture);
            const dotColor =
              status === 'green'  ? Colors.green
              : status === 'yellow' ? Colors.yellow
              : status === 'red'    ? Colors.red
              : Colors.creamDim;
            return (
              <button key={i} onClick={() => setSelectedDate(cell.date)} style={{
                aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: isToday ? Colors.goldLight : Colors.navy,
                border: `1px solid ${isToday ? Colors.gold : Colors.borderLight}`,
                borderRadius: 8, cursor: 'pointer', padding: 4, gap: 3,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: Colors.cream }}>{d.getDate()}</div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <DayDetailModal
          pet={pet}
          date={selectedDate}
          editable={selectedDate === todayStr}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}

function DayDetailModal({ pet, date, editable, onClose }: {
  pet: Pet;
  date: string;
  editable: boolean;
  onClose: () => void;
}) {
  const data = useData();
  const schedule = data.getCareSchedule(pet.id);
  const log = data.getDailyLog(pet.id, date);
  const meds = activeMedicines(schedule, date);
  const c = dayCompletion(schedule, log);

  type Row = { key: string; label: string; done: boolean };
  const rows: Row[] = [];
  if (schedule.food.enabled) schedule.food.meals.forEach((m, i) => rows.push({ key: `f-${i}`, label: `🍽️ ${m.time} ${m.portion}`.trim(), done: log.food[i] ?? false }));
  if (schedule.water.enabled) schedule.water.times.forEach((t, i) => rows.push({ key: `w-${i}`, label: `💧 ${t}`, done: log.water[i] ?? false }));
  if (schedule.activity.enabled) rows.push({ key: 'act', label: `🏃 Activity (${log.activity.minutesLogged}/${schedule.activity.targetMinutes} min)`, done: log.activity.completed || log.activity.minutesLogged >= schedule.activity.targetMinutes });
  for (const med of meds) for (const t of med.times) {
    const k = `${med.id}@${t}`;
    rows.push({ key: `m-${k}`, label: `💊 ${med.name} ${t}`.trim(), done: log.medicine[k] ?? false });
  }
  if (schedule.grooming.enabled) rows.push({ key: 'g', label: '✂️ Grooming', done: log.grooming });
  if (schedule.vet.enabled) rows.push({ key: 'v', label: '🏥 Vet visit', done: log.vet });

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalCard} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: Colors.cream }}>{format(parseISODate(date), 'EEEE, MMM d')}</div>
            <div style={{ fontSize: 12, color: Colors.creammid }}>{c.done}/{c.total} done {editable ? '· editable' : '· read-only'}</div>
          </div>
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
        {rows.length === 0
          ? <div style={{ fontSize: 13, color: Colors.creammid, padding: '12px 0' }}>Nothing scheduled for this day.</div>
          : rows.map(r => (
              <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${Colors.borderLight}` }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: r.done ? Colors.green : 'transparent',
                  border: `2px solid ${r.done ? Colors.green : Colors.border}`,
                  color: '#fff', fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{r.done ? '✓' : ''}</div>
                <div style={{ fontSize: 13, color: Colors.cream, textDecoration: r.done ? 'line-through' : 'none' }}>{r.label}</div>
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ── Shared bits ───────────────────────────────────────────────────────────────
function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 999, border: 'none',
      background: active ? '#8B5E00' : 'transparent',
      color: active ? '#fff' : Colors.cream,
      fontSize: 13, fontWeight: 600, cursor: 'pointer',
    }}>
      {children}
    </button>
  );
}

const primaryBtn: React.CSSProperties = {
  background: '#8B5E00', color: '#fff', border: 'none',
  padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(139,94,0,0.25)',
};
const editBtn: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 8, border: `1px solid ${Colors.border}`,
  background: Colors.navyLight, fontSize: 13, cursor: 'pointer', color: Colors.cream,
};
const smallBtn: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 8, border: `1px solid ${Colors.border}`,
  background: Colors.navyLight, fontSize: 12, cursor: 'pointer', color: Colors.cream,
  whiteSpace: 'nowrap', fontWeight: 600,
};
const ghostBtn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 10, border: `1px solid ${Colors.border}`,
  background: 'transparent', fontSize: 13, color: Colors.cream, cursor: 'pointer',
};
const navArrow: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: `1px solid ${Colors.border}`,
  background: Colors.navyLight, fontSize: 18, cursor: 'pointer', color: Colors.cream,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16, zIndex: 200,
};
const modalCard: React.CSSProperties = {
  background: Colors.navyMid, borderRadius: 16, padding: 18,
  border: `1px solid ${Colors.border}`, width: '100%', maxWidth: 420,
  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
  maxHeight: '85vh', overflowY: 'auto',
};
const modalInput: React.CSSProperties = {
  padding: '8px 10px', borderRadius: 8, border: `1px solid ${Colors.border}`,
  background: Colors.navy, color: Colors.cream, fontSize: 14,
};
