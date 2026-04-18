import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import { buildTimeline, calcReadinessScore, type TimelineEvent } from '../utils/timelineCalculator';
import { COUNTRIES } from '../data/travelRequirements';
import { FREE_CHECKLIST_IDS } from '../store/appStore';
import { ChecklistScene, CHECKLIST_COLOR } from '../components/Illustrations';
import { format, differenceInDays } from 'date-fns';

const CAT_ICONS: Record<string, string> = {
  document: '📄', vaccination: '💉', health: '🏥', booking: '📅', microchip: '🔬', form: '📋',
};

export default function ChecklistPage() {
  const navigate   = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const data       = useData();
  const trip       = data.trips.find(t => t.id === tripId);
  const pet        = data.pets.find(p => p.id === trip?.petId);
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [unlockPrompt, setUnlockPrompt] = useState(false);

  if (!trip) return (
    <div style={{ padding: 32, textAlign: 'center', color: Colors.creammid }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
      Trip not found. <button onClick={() => navigate('/')} style={{ color: Colors.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Go home →</button>
    </div>
  );

  const timeline = useMemo(
    () => buildTimeline(trip.checklist ?? [], new Date(trip.travelDate)),
    [trip.checklist, trip.travelDate],
  );
  const score    = calcReadinessScore(trip.checklist ?? []);
  const daysLeft = differenceInDays(new Date(trip.travelDate), new Date());
  const country  = COUNTRIES.find(c => c.code === trip.destination);
  const barColor = score >= 80 ? Colors.green : score >= 50 ? Colors.yellow : Colors.red;

  function toggle(itemId: string) {
    if (!trip!.isPremium && !FREE_CHECKLIST_IDS.includes(itemId)) { setUnlockPrompt(true); return; }
    data.toggleChecklistItem(tripId!, itemId);
  }

  const groups = useMemo(() => {
    const g: Record<string, TimelineEvent[]> = {};
    timeline.forEach(ev => { if (!g[ev.category]) g[ev.category] = []; g[ev.category].push(ev); });
    return g;
  }, [timeline]);

  return (
    <div>
      <button onClick={() => navigate('/')} style={{
        background: Colors.navyLight, border: 'none', borderRadius: 10,
        padding: '8px 12px', cursor: 'pointer', color: Colors.creammid, fontSize: 14, marginBottom: 16,
      }}>← Dashboard</button>

      {/* Hero with illustration */}
      <div style={{ position: 'relative', background: CHECKLIST_COLOR, borderRadius: 20, marginBottom: 20, overflow: 'hidden', boxShadow: `0 4px 20px ${CHECKLIST_COLOR}55` }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: '55%', opacity: 0.35 }}>
          <ChecklistScene />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>{pet?.avatarEmoji ?? '🐾'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: 'white' }}>
              {trip.tripName ?? `${pet?.name} → ${country?.name ?? trip.destination}`}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              {format(new Date(trip.travelDate), 'EEEE, MMM d yyyy')} ·{' '}
              {daysLeft === 0 ? '🛫 Today!' : daysLeft > 0 ? `${daysLeft} days away` : `${Math.abs(daysLeft)} days ago`}
            </div>
          </div>
          {!trip.isPremium && (
            <button onClick={() => setUnlockPrompt(true)} style={{
              background: Colors.gold, color: Colors.cream, border: 'none',
              padding: '6px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>🔓 Unlock</button>
          )}
        </div>

        {/* Score bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Readiness Score</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{score}%</span>
        </div>
        <div style={{ background: Colors.navyLight, borderRadius: 8, height: 8, overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: barColor, borderRadius: 8, transition: 'width .4s' }} />
        </div>

          {/* Summary */}
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>{trip.scenario?.summary}</p>
          </div>
        </div>
      </div>

      {/* Unlock modal */}
      {unlockPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: Colors.navyMid, borderRadius: 20, padding: 28, maxWidth: 360, width: '100%', boxShadow: `0 16px 48px ${Colors.shadow}` }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🔓</div>
            <h3 style={{ textAlign: 'center', marginBottom: 8, fontSize: 20 }}>Unlock Full Checklist</h3>
            <p style={{ color: Colors.creammid, fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              Get access to all {trip.checklist?.length} items, timeline tracking, and official source links for this trip.
            </p>
            <button onClick={() => { data.unlockTrip(tripId!); setUnlockPrompt(false); }} style={{
              width: '100%', padding: '14px', borderRadius: 14, background: '#2A9D8F',
              color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginBottom: 10,
            }}>✨ Unlock This Trip</button>
            <button onClick={() => setUnlockPrompt(false)} style={{
              width: '100%', padding: '10px', borderRadius: 12,
              background: Colors.navyLight, border: `1px solid ${Colors.border}`,
              color: Colors.creammid, cursor: 'pointer', fontSize: 14,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Checklist groups */}
      {Object.entries(groups).map(([cat, events]) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span>{CAT_ICONS[cat] ?? '•'}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: Colors.creammid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat}</span>
            <span style={{ fontSize: 11, color: Colors.creammid }}>({events.filter(e => e.completed).length}/{events.length})</span>
          </div>
          {events.map(ev => {
            const isLocked   = !trip.isPremium && !FREE_CHECKLIST_IDS.includes(ev.id);
            const isExpanded = expanded === ev.id;
            return (
              <div key={ev.id} style={{
                background: Colors.navyMid, borderRadius: 14, marginBottom: 8,
                border: `1px solid ${ev.completed ? Colors.green + '44' : Colors.border}`,
                boxShadow: `0 1px 6px ${Colors.shadow}`,
                opacity: ev.status === 'not_eligible' ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : ev.id)}>
                  <button onClick={e => { e.stopPropagation(); toggle(ev.id); }} style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${ev.completed ? Colors.green : Colors.border}`,
                    background: ev.completed ? Colors.green : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isLocked ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 14,
                  }}>
                    {ev.completed ? '✓' : isLocked ? '🔒' : ''}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: ev.completed ? Colors.creammid : Colors.cream, textDecoration: ev.completed ? 'line-through' : 'none' }}>
                      {ev.title}
                    </div>
                    <StatusBadge status={ev.status} daysUntilDue={ev.daysUntilDue} mandatory={ev.mandatory} />
                  </div>
                  <span style={{ color: Colors.creammid, fontSize: 12 }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
                {isExpanded && (
                  <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${Colors.borderLight}`, paddingTop: 12 }}>
                    <p style={{ fontSize: 13, color: Colors.creammid, lineHeight: 1.6, marginBottom: 10 }}>{ev.description}</p>
                    {ev.dueDate && (
                      <div style={{ fontSize: 12, color: Colors.creammid, marginBottom: 6 }}>
                        📅 Due by: <strong>{format(ev.dueDate, 'MMM d, yyyy')}</strong>
                      </div>
                    )}
                    <a href={ev.officialSource} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2A9D8F', fontWeight: 600 }}>
                      🔗 Official Source ↗
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, daysUntilDue, mandatory }: { status: string; daysUntilDue: number | null; mandatory: boolean }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    overdue:      { bg: Colors.redBg,    color: Colors.red,      label: '🔴 Overdue'        },
    urgent:       { bg: Colors.orangeBg, color: Colors.orange,   label: '🟠 Urgent'         },
    upcoming:     { bg: Colors.yellowBg, color: Colors.yellow,   label: '🟡 Upcoming'       },
    scheduled:    { bg: Colors.blueBg,   color: Colors.blue,     label: '🔵 Scheduled'      },
    completed:    { bg: Colors.greenBg,  color: Colors.green,    label: '✅ Done'           },
    anytime:      { bg: Colors.navyLight, color: Colors.creammid, label: '⬜ Anytime'       },
    not_eligible: { bg: Colors.navyLight, color: Colors.creammid, label: '⊘ Not applicable' },
  };
  const c = cfg[status] ?? cfg['anytime'];
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color }}>
        {c.label}{daysUntilDue !== null && status !== 'completed' ? ` · ${daysUntilDue}d` : ''}
      </span>
      {mandatory && (
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: Colors.redBg, color: Colors.red }}>Required</span>
      )}
    </div>
  );
}
