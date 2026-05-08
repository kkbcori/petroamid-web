import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import type { CareSchedule, Medicine } from '../store/appStore';
import { defaultCareSchedule } from '../store/appStore';
import { calcVetNextDue, expandMedicineTimes, todayISO } from '../utils/careTime';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function CareSetupPage() {
  const { petId = '' } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const data = useData();
  const pet = data.pets.find(p => p.id === petId);

  const initial = useMemo<CareSchedule>(() => {
    return data.getCareSchedule(petId) ?? defaultCareSchedule(petId);
  }, [data, petId]);

  const [schedule, setSchedule] = useState<CareSchedule>(initial);
  const [saved, setSaved] = useState(false);

  if (!pet) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: Colors.creammid, marginBottom: 16 }}>Pet not found.</p>
        <button onClick={() => navigate('/care')} style={primaryBtn}>Back to Care</button>
      </div>
    );
  }

  function update<K extends keyof CareSchedule>(key: K, value: CareSchedule[K]) {
    setSchedule(s => ({ ...s, [key]: value }));
  }

  function save() {
    // recompute vet nextDue
    const vet = {
      ...schedule.vet,
      nextDue: calcVetNextDue(schedule.vet.lastVisit, schedule.vet.intervalMonths),
    };
    // ensure medicine times are expanded
    const medicine: Medicine[] = schedule.medicine.map(m => ({
      ...m,
      times: m.times.length > 0 ? m.times : expandMedicineTimes(m),
    }));
    const next: CareSchedule = { ...schedule, vet, medicine };
    data.setCareSchedule(petId, next);
    setSchedule(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={() => navigate('/care')} style={backBtn}>← Back</button>
        <div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: Colors.cream }}>
            Care Schedule
          </div>
          <div style={{ fontSize: 13, color: Colors.creammid }}>
            {pet.avatarEmoji ?? '🐾'} {pet.name}
          </div>
        </div>
      </div>

      {/* Food */}
      <SectionCard title="🍽️ Food" enabled={schedule.food.enabled} onToggle={v => update('food', { ...schedule.food, enabled: v })}>
        {schedule.food.enabled && (
          <>
            {schedule.food.meals.map((meal, i) => (
              <Row key={i}>
                <input type="time" value={meal.time}
                  onChange={e => {
                    const meals = [...schedule.food.meals];
                    meals[i] = { ...meals[i], time: e.target.value };
                    update('food', { ...schedule.food, meals });
                  }}
                  style={timeInput}
                />
                <input type="text" placeholder="Portion / notes" value={meal.portion}
                  onChange={e => {
                    const meals = [...schedule.food.meals];
                    meals[i] = { ...meals[i], portion: e.target.value };
                    update('food', { ...schedule.food, meals });
                  }}
                  style={textInput}
                />
                <button style={removeBtn} onClick={() => {
                  const meals = schedule.food.meals.filter((_, j) => j !== i);
                  update('food', { ...schedule.food, meals });
                }}>✕</button>
              </Row>
            ))}
            <button style={addBtn} onClick={() => update('food', { ...schedule.food, meals: [...schedule.food.meals, { time: '08:00', portion: '' }] })}>
              + Add meal
            </button>
          </>
        )}
      </SectionCard>

      {/* Water */}
      <SectionCard title="💧 Water" enabled={schedule.water.enabled} onToggle={v => update('water', { ...schedule.water, enabled: v })}>
        {schedule.water.enabled && (
          <>
            {schedule.water.times.map((t, i) => (
              <Row key={i}>
                <input type="time" value={t}
                  onChange={e => {
                    const times = [...schedule.water.times];
                    times[i] = e.target.value;
                    update('water', { ...schedule.water, times });
                  }}
                  style={timeInput}
                />
                <button style={removeBtn} onClick={() => {
                  const times = schedule.water.times.filter((_, j) => j !== i);
                  update('water', { ...schedule.water, times });
                }}>✕</button>
              </Row>
            ))}
            <button style={addBtn} onClick={() => update('water', { ...schedule.water, times: [...schedule.water.times, '12:00'] })}>
              + Add reminder
            </button>
          </>
        )}
      </SectionCard>

      {/* Activity */}
      <SectionCard title="🏃 Activity" enabled={schedule.activity.enabled} onToggle={v => update('activity', { ...schedule.activity, enabled: v })}>
        {schedule.activity.enabled && (
          <>
            <Row>
              <label style={fieldLabel}>Target / day</label>
              <input type="number" min={0} value={schedule.activity.targetMinutes}
                onChange={e => update('activity', { ...schedule.activity, targetMinutes: Math.max(0, Number(e.target.value) || 0) })}
                style={{ ...textInput, width: 90 }}
              />
              <span style={{ fontSize: 13, color: Colors.creammid }}>minutes</span>
            </Row>
            {schedule.activity.reminderTimes.map((t, i) => (
              <Row key={i}>
                <input type="time" value={t}
                  onChange={e => {
                    const reminderTimes = [...schedule.activity.reminderTimes];
                    reminderTimes[i] = e.target.value;
                    update('activity', { ...schedule.activity, reminderTimes });
                  }}
                  style={timeInput}
                />
                <button style={removeBtn} onClick={() => {
                  const reminderTimes = schedule.activity.reminderTimes.filter((_, j) => j !== i);
                  update('activity', { ...schedule.activity, reminderTimes });
                }}>✕</button>
              </Row>
            ))}
            <button style={addBtn} onClick={() => update('activity', { ...schedule.activity, reminderTimes: [...schedule.activity.reminderTimes, '17:00'] })}>
              + Add reminder
            </button>
          </>
        )}
      </SectionCard>

      {/* Medicine */}
      <SectionCard title="💊 Medicine" enabled={schedule.medicine.length > 0} onToggle={v => {
        if (!v) update('medicine', []);
        else update('medicine', [{
          id: uid(), name: '', dose: '', frequency: 'once', times: ['09:00'],
          startDate: todayISO(),
        }]);
      }}>
        {schedule.medicine.map((m, i) => (
          <div key={m.id} style={{ background: Colors.navyLight, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${Colors.borderLight}` }}>
            <Row>
              <input type="text" placeholder="Name" value={m.name}
                onChange={e => {
                  const next = [...schedule.medicine];
                  next[i] = { ...m, name: e.target.value };
                  update('medicine', next);
                }}
                style={{ ...textInput, flex: 1 }}
              />
              <button style={removeBtn} onClick={() => update('medicine', schedule.medicine.filter((_, j) => j !== i))}>✕</button>
            </Row>
            <Row>
              <input type="text" placeholder="Dose (e.g. 5mg)" value={m.dose}
                onChange={e => {
                  const next = [...schedule.medicine];
                  next[i] = { ...m, dose: e.target.value };
                  update('medicine', next);
                }}
                style={{ ...textInput, flex: 1 }}
              />
            </Row>
            <Row>
              <label style={fieldLabel}>Frequency</label>
              <select value={m.frequency}
                onChange={e => {
                  const freq = e.target.value as Medicine['frequency'];
                  const updated = { ...m, frequency: freq };
                  updated.times = expandMedicineTimes(updated);
                  const next = [...schedule.medicine];
                  next[i] = updated;
                  update('medicine', next);
                }}
                style={selectInput}
              >
                <option value="once">Once daily</option>
                <option value="twice">Twice daily</option>
                <option value="three">Three times daily</option>
                <option value="custom">Custom interval</option>
              </select>
            </Row>
            {m.frequency === 'custom' && (
              <Row>
                <label style={fieldLabel}>Every</label>
                <input type="number" min={1} max={24} value={m.intervalHours ?? 12}
                  onChange={e => {
                    const intervalHours = Math.max(1, Number(e.target.value) || 12);
                    const next = [...schedule.medicine];
                    const updated = { ...m, intervalHours };
                    updated.times = expandMedicineTimes(updated);
                    next[i] = updated;
                    update('medicine', next);
                  }}
                  style={{ ...textInput, width: 80 }}
                />
                <span style={{ fontSize: 13, color: Colors.creammid }}>hours</span>
              </Row>
            )}
            <Row>
              <label style={fieldLabel}>Start</label>
              <input type="date" value={m.startDate}
                onChange={e => {
                  const next = [...schedule.medicine];
                  next[i] = { ...m, startDate: e.target.value };
                  update('medicine', next);
                }}
                style={textInput}
              />
              <label style={fieldLabel}>End (optional)</label>
              <input type="date" value={m.endDate ?? ''}
                onChange={e => {
                  const next = [...schedule.medicine];
                  next[i] = { ...m, endDate: e.target.value || undefined };
                  update('medicine', next);
                }}
                style={textInput}
              />
            </Row>
            <div style={{ fontSize: 11, color: Colors.creammid, marginTop: 4 }}>
              Reminders: {expandMedicineTimes(m).join(', ')}
            </div>
          </div>
        ))}
        <button style={addBtn} onClick={() => update('medicine', [...schedule.medicine, {
          id: uid(), name: '', dose: '', frequency: 'once', times: ['09:00'], startDate: todayISO(),
        }])}>
          + Add medicine
        </button>
      </SectionCard>

      {/* Grooming */}
      <SectionCard title="✂️ Grooming" enabled={schedule.grooming.enabled} onToggle={v => update('grooming', { ...schedule.grooming, enabled: v })}>
        {schedule.grooming.enabled && (
          <>
            <Row>
              <label style={fieldLabel}>Every</label>
              <input type="number" min={1} value={schedule.grooming.intervalDays}
                onChange={e => update('grooming', { ...schedule.grooming, intervalDays: Math.max(1, Number(e.target.value) || 30) })}
                style={{ ...textInput, width: 80 }}
              />
              <span style={{ fontSize: 13, color: Colors.creammid }}>days</span>
            </Row>
            <Row>
              <label style={fieldLabel}>Last done</label>
              <input type="date" value={schedule.grooming.lastDone ?? ''}
                onChange={e => update('grooming', { ...schedule.grooming, lastDone: e.target.value || undefined })}
                style={textInput}
              />
            </Row>
          </>
        )}
      </SectionCard>

      {/* Vet */}
      <SectionCard title="🏥 Vet Visit" enabled={schedule.vet.enabled} onToggle={v => update('vet', { ...schedule.vet, enabled: v })}>
        {schedule.vet.enabled && (
          <>
            <Row>
              <label style={fieldLabel}>Every</label>
              <input type="number" min={1} value={schedule.vet.intervalMonths}
                onChange={e => update('vet', { ...schedule.vet, intervalMonths: Math.max(1, Number(e.target.value) || 12) })}
                style={{ ...textInput, width: 80 }}
              />
              <span style={{ fontSize: 13, color: Colors.creammid }}>months</span>
            </Row>
            <Row>
              <label style={fieldLabel}>Last visit</label>
              <input type="date" value={schedule.vet.lastVisit ?? ''}
                onChange={e => update('vet', { ...schedule.vet, lastVisit: e.target.value || undefined })}
                style={textInput}
              />
            </Row>
            <div style={{ fontSize: 12, color: Colors.creammid, marginTop: 4 }}>
              Next due: {calcVetNextDue(schedule.vet.lastVisit, schedule.vet.intervalMonths) ?? '—'}
            </div>
          </>
        )}
      </SectionCard>

      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
        <button onClick={save} style={primaryBtn}>Save schedule</button>
        {saved && <span style={{ fontSize: 13, color: Colors.green }}>✓ Saved</span>}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionCard({ title, enabled, onToggle, children }: {
  title: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div style={{
      background: Colors.navyMid, border: `1px solid ${Colors.border}`,
      borderRadius: 16, padding: '14px 16px', marginBottom: 12,
      boxShadow: `0 2px 10px ${Colors.shadow}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enabled ? 10 : 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream }}>{title}</div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 999,
      background: checked ? Colors.green : Colors.creamDim,
      position: 'relative', transition: 'background .15s',
      border: 'none', cursor: 'pointer', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left .15s',
      }} />
    </button>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>{children}</div>;
}

const textInput: React.CSSProperties = {
  padding: '8px 10px', borderRadius: 8, border: `1px solid ${Colors.border}`,
  background: Colors.navy, color: Colors.cream, fontSize: 14,
};
const timeInput: React.CSSProperties = { ...textInput, width: 110 };
const selectInput: React.CSSProperties = { ...textInput, minWidth: 160 };
const fieldLabel: React.CSSProperties = { fontSize: 12, color: Colors.creammid, fontWeight: 600 };
const primaryBtn: React.CSSProperties = {
  background: '#8B5E00', color: '#fff', border: 'none',
  padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(139,94,0,0.25)',
};
const backBtn: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 8, border: `1px solid ${Colors.border}`,
  background: Colors.navyLight, fontSize: 13, cursor: 'pointer', color: Colors.cream,
};
const addBtn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 8, border: `1px dashed ${Colors.border}`,
  background: 'transparent', fontSize: 13, color: Colors.cream, cursor: 'pointer',
  fontWeight: 600,
};
const removeBtn: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 8, border: `1px solid ${Colors.redBg}`,
  background: Colors.redBg, color: Colors.red, fontSize: 13, cursor: 'pointer',
};
