import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { hasValidVaccination } from '../store/appStore';

export default function PetsPage() {
  const navigate  = useNavigate();
  const data      = useData();
  const { pets, deletePet } = data;
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  function petAge(dob: string) {
    const years  = differenceInYears(new Date(), new Date(dob));
    const months = differenceInMonths(new Date(), new Date(dob)) % 12;
    if (years > 0) return `${years}y ${months}m`;
    return `${differenceInMonths(new Date(), new Date(dob))}m`;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontFamily: "'Playfair Display', Georgia, serif", color: Colors.cream }}>My Pets</h1>
        <button onClick={() => navigate('/pets/add')} style={{
          background: Colors.teal, color: '#fff', border: 'none',
          padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          + Add Pet
        </button>
      </div>

      {pets.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: Colors.navyMid, borderRadius: 20, border: `2px dashed ${Colors.border}`,
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🐾</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>No pets yet</h2>
          <p style={{ color: Colors.creammid, marginBottom: 20 }}>Add your dog or cat to generate a travel checklist.</p>
          <button onClick={() => navigate('/pets/add')} style={{
            background: Colors.teal, color: '#fff', border: 'none',
            padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer',
          }}>Add My Pet</button>
        </div>
      )}

      {pets.map(pet => {
        const vaccOk = hasValidVaccination(pet.vaccinations);
        return (
          <div key={pet.id} style={{
            background: Colors.navyMid, border: `1px solid ${Colors.border}`,
            borderRadius: 18, marginBottom: 14, overflow: 'hidden',
            boxShadow: `0 2px 10px ${Colors.shadow}`,
          }}>
            {/* Pet header */}
            <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: Colors.tealGlow, border: `2px solid ${Colors.teal}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>
                {pet.avatarEmoji ?? (pet.species === 'cat' ? '🐱' : '🐶')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: Colors.cream }}>{pet.name}</div>
                <div style={{ fontSize: 13, color: Colors.creammid }}>
                  {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                  {pet.breed ? ` · ${pet.breed}` : ''} · Age {petAge(pet.dateOfBirth)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/pets/edit/${pet.id}`)} style={{
                  padding: '6px 12px', borderRadius: 8, border: `1px solid ${Colors.border}`,
                  background: Colors.navyLight, fontSize: 13, cursor: 'pointer', color: Colors.cream,
                }}>Edit</button>
                <button onClick={() => setDelConfirm(pet.id)} style={{
                  padding: '6px 10px', borderRadius: 8, border: `1px solid ${Colors.redBg}`,
                  background: Colors.redBg, fontSize: 13, cursor: 'pointer', color: Colors.red,
                }}>🗑</button>
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InfoChip label="Microchip" value={pet.microchipNumber ? '✅ ' + pet.microchipNumber.slice(0,8) + '…' : '❌ Not recorded'} />
              <InfoChip label="Vaccinations" value={vaccOk ? `✅ ${pet.vaccinations.length} record${pet.vaccinations.length > 1 ? 's' : ''}` : '⚠️ Check validity'} />
              {pet.vetClinic && <InfoChip label="Vet" value={pet.vetClinic} />}
              {pet.color && <InfoChip label="Colour" value={pet.color} />}
            </div>

            {/* Vaccinations list */}
            {pet.vaccinations.length > 0 && (
              <div style={{
                borderTop: `1px solid ${Colors.border}`, padding: '12px 20px',
                background: Colors.navyLight,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: Colors.creammid, marginBottom: 8 }}>VACCINATIONS</div>
                {pet.vaccinations.map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: Colors.cream }}>{v.vaccineName}</span>
                    <span style={{ fontSize: 12, color: Colors.creammid }}>
                      {v.nextDueDate ? `Due: ${format(new Date(v.nextDueDate), 'MMM d, yyyy')}` : 'No expiry'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Delete confirm */}
            {delConfirm === pet.id && (
              <div style={{
                borderTop: `1px solid ${Colors.redBg}`, padding: '14px 20px',
                background: Colors.redBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 14, color: Colors.red }}>Delete {pet.name}? This cannot be undone.</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setDelConfirm(null)} style={{
                    padding: '6px 12px', borderRadius: 8, border: `1px solid ${Colors.border}`,
                    background: Colors.navyMid, cursor: 'pointer', fontSize: 13,
                  }}>Cancel</button>
                  <button onClick={() => { deletePet(pet.id); setDelConfirm(null); }} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: Colors.red, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: Colors.navyLight, borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: Colors.creammid, marginBottom: 2 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, color: Colors.cream }}>{value}</div>
    </div>
  );
}
