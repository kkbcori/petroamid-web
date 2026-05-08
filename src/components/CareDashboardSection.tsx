import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import type { CareSchedule, DailyLog, Medicine, Pet } from '../store/appStore';
import { activeMedicines, dayCompletion, nowHHMM, todayISO } from '../utils/careTime';

interface NextItem {
  label: string;
  time: string;     // 'HH:mm'
  done: boolean;
  overdue: boolean;
}

function nextPending(schedule: CareSchedule, log: DailyLog, now: string): NextItem | null {
  const items: NextItem[] = [];

  if (schedule.food.enabled) {
    schedule.food.meals.forEach((meal, i) => items.push({
      label: `🍽️ ${meal.portion || 'Meal'}`, time: meal.time, done: log.food[i] ?? false, overdue: false,
    }));
  }
  if (schedule.water.enabled) {
    schedule.water.times.forEach((t, i) => items.push({
      label: '💧 Water', time: t, done: log.water[i] ?? false, overdue: false,
    }));
  }
  if (schedule.activity.enabled) {
    schedule.activity.reminderTimes.forEach(t => items.push({
      label: `🏃 Activity`, time: t,
      done: log.activity.completed || log.activity.minutesLogged >= schedule.activity.targetMinutes,
      overdue: false,
    }));
  }
  for (const med of activeMedicines(schedule, log.date)) {
    for (const t of med.times) {
      items.push({
        label: `💊 ${med.name || 'Medicine'}`,
        time: t,
        done: log.medicine[`${med.id}@${t}`] ?? false,
        overdue: false,
      });
    }
  }

  const pending = items.filter(i => !i.done);
  if (pending.length === 0) return null;

  // Mark overdue (time has passed today)
  const annotated = pending.map(i => ({ ...i, overdue: i.time <= now }));
  // Prefer overdue items first (latest overdue, since most pressing recent),
  // then upcoming items in chronological order.
  annotated.sort((a, b) => {
    if (a.overdue && !b.overdue) return -1;
    if (!a.overdue && b.overdue) return 1;
    return a.time.localeCompare(b.time);
  });
  return annotated[0];
}

export default function CareDashboardSection() {
  const navigate = useNavigate();
  const data = useData();
  const today = todayISO();
  const now = nowHHMM();

  const rows = useMemo(() => {
    return data.pets.map((pet: Pet) => {
      const schedule = data.getCareSchedule(pet.id);
      const isConfigured =
        schedule.food.enabled || schedule.water.enabled || schedule.activity.enabled ||
        schedule.medicine.length > 0 || schedule.grooming.enabled || schedule.vet.enabled;
      if (!isConfigured) return { pet, configured: false as const };
      const log = data.getDailyLog(pet.id, today);
      const completion = dayCompletion(schedule, log);
      const next = nextPending(schedule, log, now);
      return { pet, configured: true as const, completion, next };
    });
    // depend on pets identity, current day, and store changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.pets, data.careSchedules, data.dailyLogs, today, now]);

  if (rows.length === 0) return null;

  const anyConfigured = rows.some(r => r.configured);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: Colors.cream }}>Today's Care</h2>
        <button onClick={() => navigate('/care')} style={{
          color: '#2A9D8F', fontSize: 13, fontWeight: 600,
          background: 'none', border: 'none', cursor: 'pointer',
        }}>View all →</button>
      </div>

      {!anyConfigured ? (
        <div onClick={() => navigate('/care')} style={{
          background: Colors.navyMid, border: `1px dashed ${Colors.border}`,
          borderRadius: 16, padding: '18px 18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 32 }}>🐾</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: Colors.cream }}>Set up daily care</div>
            <div style={{ fontSize: 12, color: Colors.creammid, marginTop: 2 }}>
              Track meals, water, activity, medicine, grooming and vet visits.
            </div>
          </div>
          <span style={{ color: Colors.creammid }}>›</span>
        </div>
      ) : (
        rows.map(row => (
          <PetCareRow key={row.pet.id} row={row} onClick={() => navigate('/care')} onConfigure={() => navigate(`/care/setup/${row.pet.id}`)} />
        ))
      )}
    </div>
  );
}

function PetCareRow({ row, onClick, onConfigure }: {
  row: { pet: Pet; configured: false } | { pet: Pet; configured: true; completion: { done: number; total: number; ratio: number }; next: NextItem | null };
  onClick: () => void;
  onConfigure: () => void;
}) {
  const { pet } = row;

  if (!row.configured) {
    return (
      <div style={cardStyle}>
        <Avatar pet={pet} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: Colors.cream }}>{pet.name}</div>
          <div style={{ fontSize: 12, color: Colors.creammid, marginTop: 2 }}>No care schedule yet</div>
        </div>
        <button onClick={onConfigure} style={{
          padding: '6px 12px', borderRadius: 8, border: `1px solid ${Colors.border}`,
          background: Colors.navyLight, fontSize: 12, cursor: 'pointer', color: Colors.cream, fontWeight: 600,
        }}>Set up</button>
      </div>
    );
  }

  const { completion, next } = row;
  const summary = next
    ? next.overdue
      ? <span style={{ color: Colors.red }}>{next.label} · {next.time} (overdue)</span>
      : <span style={{ color: Colors.creammid }}>{next.label} · {next.time}</span>
    : <span style={{ color: Colors.green }}>All done for today ✓</span>;

  return (
    <div onClick={onClick} style={{ ...cardStyle, cursor: 'pointer' }}>
      <Avatar pet={pet} />
      <MiniRing ratio={completion.ratio} done={completion.done} total={completion.total} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: Colors.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pet.name}</div>
        <div style={{ fontSize: 12, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
      </div>
      <span style={{ color: Colors.creammid }}>›</span>
    </div>
  );
}

function Avatar({ pet }: { pet: Pet }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: Colors.navyLight, border: `1px solid ${Colors.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
    }}>
      {pet.avatarEmoji ?? (pet.species === 'cat' ? '🐱' : '🐶')}
    </div>
  );
}

function MiniRing({ ratio, done, total }: { ratio: number; done: number; total: number }) {
  const size = 38;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.max(0, Math.min(1, ratio)) * circ;
  const color = ratio >= 1 ? Colors.green : ratio >= 0.5 ? Colors.gold : Colors.tealDark;
  const pct = total === 0 ? 0 : Math.round(ratio * 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} aria-label={`${done} of ${total} done`}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke={Colors.border} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: Colors.cream }}>
        {pct}%
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 14px', background: Colors.navyMid,
  border: `1px solid ${Colors.border}`, borderRadius: 14, marginBottom: 8,
  boxShadow: `0 2px 8px ${Colors.shadow}`,
};
