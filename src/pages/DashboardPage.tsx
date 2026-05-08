import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import { calcReadinessScore } from '../utils/timelineCalculator';
import { COUNTRIES } from '../data/travelRequirements';
import type { Pet, Trip } from '../store/appStore';
import { format, differenceInDays } from 'date-fns';
import { DashboardBanner, DASHBOARD_COLOR } from '../components/Illustrations';
import CareDashboardSection from '../components/CareDashboardSection';

export default function DashboardPage() {
  const navigate  = useNavigate();
  const profile   = useProfileStore(s => s.activeProfile());
  const data      = useData();
  const { pets, trips } = data;
  const activeTrips = trips.filter((t: Trip) => differenceInDays(new Date(t.travelDate), new Date()) >= 0);
  const pastTrips   = trips.filter((t: Trip) => differenceInDays(new Date(t.travelDate), new Date()) < 0);
  const firstName   = profile?.displayName.split(' ')[0] ?? 'there';
  const greeting    = getGreeting();

  return (
    <div>
      <DashboardBanner
        title={`${greeting}, ${firstName} ${profile?.avatarEmoji ?? ''}`}
        subtitle={pets.length === 0 ? 'Add your first pet to get started' : `${pets.length} pet${pets.length > 1 ? 's' : ''} · ${activeTrips.length} upcoming trip${activeTrips.length !== 1 ? 's' : ''}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        <QuickCard icon="🐾" title="Add a Pet"   desc="Dogs & cats"   onClick={() => navigate('/pets/add')} />
        <QuickCard icon="✈️" title="Plan a Trip" desc="Get checklist" onClick={() => pets.length > 0 ? navigate('/trips/new') : navigate('/pets/add')} />
      </div>

      {pets.length > 0 && <CareDashboardSection />}

      {activeTrips.length > 0 && (
        <Section title="Upcoming Trips">
          {activeTrips.map((trip: Trip) => {
            const pet      = pets.find((p: Pet) => p.id === trip.petId);
            const score    = calcReadinessScore(trip.checklist ?? []);
            const daysLeft = differenceInDays(new Date(trip.travelDate), new Date());
            const country  = COUNTRIES.find(c => c.code === trip.destination);
            return (
              <TripCard key={trip.id} pet={pet} trip={trip} score={score} daysLeft={daysLeft}
                countryName={country?.name ?? trip.destination}
                onClick={() => navigate(`/trips/${trip.id}`)} />
            );
          })}
        </Section>
      )}

      {pets.length > 0 && (
        <Section title="Your Pets" action={{ label: 'View All', onClick: () => navigate('/pets') }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {pets.map((pet: Pet) => (
              <div key={pet.id} onClick={() => navigate('/pets')} style={{
                background: Colors.navyMid, border: `1px solid ${Colors.border}`,
                borderRadius: 14, padding: 16, textAlign: 'center', cursor: 'pointer',
              }}>
                <div style={{ fontSize: 34, marginBottom: 6 }}>{pet.avatarEmoji ?? (pet.species === 'cat' ? '🐱' : '🐶')}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{pet.name}</div>
                <div style={{ fontSize: 12, color: Colors.creammid, textTransform: 'capitalize' }}>{pet.species}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {pets.length === 0 && trips.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: DASHBOARD_COLOR, borderRadius: 20, border: `1px solid rgba(0,0,0,0.06)` }}>
          <img src="/petroamid-web/logo.jpg" alt="" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', marginBottom: 14, display: 'block', margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 8 }}>Ready to Explore?</h2>
          <p style={{ color: Colors.creammid, marginBottom: 24, lineHeight: 1.6 }}>Add your pet to generate a personalised travel compliance checklist.</p>
          <button onClick={() => navigate('/pets/add')} style={{ background: '#2A9D8F', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>🐾 Add My Pet</button>
        </div>
      )}

      {pastTrips.length > 0 && (
        <Section title="Past Trips">
          {pastTrips.slice(0, 3).map((trip: Trip) => {
            const pet = pets.find((p: Pet) => p.id === trip.petId);
            const country = COUNTRIES.find(c => c.code === trip.destination);
            return (
              <div key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: Colors.navyMid, borderRadius: 12, marginBottom: 8,
                border: `1px solid ${Colors.border}`, cursor: 'pointer', opacity: 0.7,
              }}>
                <span style={{ fontSize: 24 }}>{pet?.avatarEmoji ?? '🐾'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{pet?.name} → {country?.name ?? trip.destination}</div>
                  <div style={{ fontSize: 12, color: Colors.creammid }}>{format(new Date(trip.travelDate), 'MMM d, yyyy')}</div>
                </div>
                <span style={{ color: Colors.creammid }}>›</span>
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: Colors.cream }}>{title}</h2>
        {action && <button onClick={action.onClick} style={{ color: '#2A9D8F', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>{action.label} →</button>}
      </div>
      {children}
    </div>
  );
}
function QuickCard({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: '18px 16px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: `0 2px 8px ${Colors.shadow}` }}>
      <div style={{ fontSize: 26 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream }}>{title}</div>
      <div style={{ fontSize: 12, color: Colors.creammid }}>{desc}</div>
    </button>
  );
}
function TripCard({ pet, trip, score, daysLeft, countryName, onClick }: { pet: Pet | undefined; trip: Trip; score: number; daysLeft: number; countryName: string; onClick: () => void }) {
  const barColor = score >= 80 ? Colors.green : score >= 50 ? Colors.yellow : Colors.red;
  return (
    <div onClick={onClick} style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 16, padding: 20, marginBottom: 12, cursor: 'pointer', boxShadow: `0 2px 12px ${Colors.shadow}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 30 }}>{pet?.avatarEmoji ?? '🐾'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: Colors.cream }}>{pet?.name ?? 'Pet'} → {countryName}</div>
            <div style={{ fontSize: 12, color: Colors.creammid }}>{format(new Date(trip.travelDate), 'MMM d, yyyy')} · {daysLeft === 0 ? 'Today!' : `${daysLeft}d away`}</div>
          </div>
        </div>
        <div style={{ background: score >= 80 ? Colors.greenBg : score >= 50 ? Colors.yellowBg : Colors.redBg, color: barColor, borderRadius: 20, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>{score}%</div>
      </div>
      <div style={{ background: Colors.navyLight, borderRadius: 6, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: barColor, borderRadius: 6, transition: 'width .4s' }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: Colors.creammid }}>
        {trip.checklist?.filter(c => c.completed).length ?? 0} / {trip.checklist?.length ?? 0} complete
        {!trip.isPremium && <span style={{ marginLeft: 8, color: Colors.gold }}>🔒 Free tier</span>}
      </div>
    </div>
  );
}
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
