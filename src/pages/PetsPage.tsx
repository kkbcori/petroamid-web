import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import type { Pet, VaccinationRecord } from '../store/appStore';
import { hasValidVaccination } from '../store/appStore';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { PageHeader, PetsScene, PETS_COLOR } from '../components/Illustrations';

export default function PetsPage() {
  const navigate = useNavigate();
  const { pets, deletePet } = useData();
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  function petAge(dob: string) {
    const years  = differenceInYears(new Date(), new Date(dob));
    const months = differenceInMonths(new Date(), new Date(dob)) % 12;
    return years > 0 ? `${years}y ${months}m` : `${differenceInMonths(new Date(), new Date(dob))}m`;
  }

  return (
    <div>
      <PageHeader title="My Pets 🐾" subtitle="Manage your furry travel companions" color={PETS_COLOR}>
        <PetsScene />
      </PageHeader>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => navigate('/pets/add')} style={{
          background: PETS_COLOR, color: '#fff', border: 'none',
          padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
          boxShadow: `0 4px 12px ${PETS_COLOR}55`,
        }}>+ Add Pet</button>
      </div>

      {pets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: Colors.navyMid, borderRadius: 20, border: `2px dashed ${Colors.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>No pets yet</h2>
          <p style={{ color: Colors.creammid, marginBottom: 20 }}>Add your dog or cat to generate a travel checklist.</p>
          <button onClick={() => navigate('/pets/add')} style={{ background: PETS_COLOR, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Add My Pet</button>
        </div>
      )}

      {pets.map((pet: Pet) => {
        const vaccOk = hasValidVaccination(pet.vaccinations);
        return (
          <div key={pet.id} style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 18, marginBottom: 14, overflow: 'hidden', boxShadow: `0 2px 10px ${Colors.shadow}` }}>
            <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${PETS_COLOR}22`, border: `2px solid ${PETS_COLOR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {pet.avatarEmoji ?? (pet.species === 'cat' ? '🐱' : '🐶')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: Colors.cream }}>{pet.name}</div>
                <div style={{ fontSize: 13, color: Colors.creammid }}>
                  {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}{pet.breed ? ` · ${pet.breed}` : ''} · Age {petAge(pet.dateOfBirth)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/pets/edit/${pet.id}`)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${Colors.border}`, background: Colors.navyLight, fontSize: 13, cursor: 'pointer', color: Colors.cream }}>Edit</button>
                <button onClick={() => setDelConfirm(pet.id)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${Colors.redBg}`, background: Colors.redBg, fontSize: 13, cursor: 'pointer', color: Colors.red }}>🗑</button>
              </div>
            </div>
            <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InfoChip label="Microchip"    value={pet.microchipNumber ? '✅ ' + pet.microchipNumber.slice(0, 8) + '…' : '❌ Not recorded'} color={PETS_COLOR} />
              <InfoChip label="Vaccinations" value={vaccOk ? `✅ ${pet.vaccinations.length} record${pet.vaccinations.length > 1 ? 's' : ''}` : '⚠️ Check validity'} color={PETS_COLOR} />
              {pet.vetClinic && <InfoChip label="Vet"    value={pet.vetClinic} color={PETS_COLOR} />}
              {pet.color     && <InfoChip label="Colour" value={pet.color}     color={PETS_COLOR} />}
            </div>
            {pet.vaccinations.length > 0 && (
              <div style={{ borderTop: `1px solid ${Colors.border}`, padding: '10px 18px', background: Colors.navyLight }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: Colors.creammid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vaccinations</div>
                {pet.vaccinations.map((v: VaccinationRecord) => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>💉 {v.vaccineName}</span>
                    <span style={{ fontSize: 12, color: Colors.creammid }}>{v.nextDueDate ? `Due: ${format(new Date(v.nextDueDate), 'MMM d, yyyy')}` : 'No expiry'}</span>
                  </div>
                ))}
              </div>
            )}
            {delConfirm === pet.id && (
              <div style={{ borderTop: `1px solid ${Colors.redBg}`, padding: '12px 18px', background: Colors.redBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: Colors.red }}>Delete {pet.name}? Cannot be undone.</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setDelConfirm(null)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${Colors.border}`, background: Colors.navyMid, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  <button onClick={() => { deletePet(pet.id); setDelConfirm(null); }} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: Colors.red, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function InfoChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: Colors.navyLight, borderRadius: 8, padding: '8px 10px', borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: Colors.creammid, marginBottom: 2, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, color: Colors.cream }}>{value}</div>
    </div>
  );
}
