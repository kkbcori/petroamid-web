import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../store/AppContext';
import { Colors } from '../utils/theme';
import type { Pet, VaccinationRecord } from '../store/appStore';
import { v4 as uuid } from 'uuid';

const PET_EMOJIS = ['🐶','🐱','🦮','🐕','🐈','🐩','🦜','🐇'];

export default function AddPetPage() {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId?: string }>();
  const data = useData();
  const editingPet = petId ? data.pets.find((p: Pet) => p.id === petId) : undefined;
  const isEdit = !!editingPet;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<Pet>>({
    name: editingPet?.name ?? '',
    species: editingPet?.species ?? 'dog',
    breed: editingPet?.breed ?? '',
    dateOfBirth: editingPet?.dateOfBirth ?? '',
    microchipNumber: editingPet?.microchipNumber ?? '',
    color: editingPet?.color ?? '',
    avatarEmoji: editingPet?.avatarEmoji ?? '🐶',
    vetName: editingPet?.vetName ?? '',
    vetPhone: editingPet?.vetPhone ?? '',
    vetClinic: editingPet?.vetClinic ?? '',
    vaccinations: editingPet?.vaccinations ?? [],
  });
  const [newVacc, setNewVacc] = useState({ name: '', dateAdmin: '', nextDue: '' });
  const [error, setError] = useState('');

  function update<K extends keyof Pet>(field: K, value: Pet[K]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function addVaccination() {
    if (!newVacc.name || !newVacc.dateAdmin) { setError('Enter vaccine name and date'); return; }
    const rec: VaccinationRecord = {
      id: uuid(), vaccineName: newVacc.name.trim(),
      dateAdministered: newVacc.dateAdmin,
      nextDueDate: newVacc.nextDue || undefined,
    };
    setForm(f => ({ ...f, vaccinations: [...(f.vaccinations ?? []), rec] }));
    setNewVacc({ name: '', dateAdmin: '', nextDue: '' });
    setError('');
  }

  function removeVacc(id: string) {
    setForm(f => ({ ...f, vaccinations: (f.vaccinations ?? []).filter((v: VaccinationRecord) => v.id !== id) }));
  }

  function handleSave() {
    if (!form.name?.trim())  { setError('Name is required'); return; }
    if (!form.dateOfBirth)   { setError('Date of birth is required'); return; }
    if (isEdit && petId) {
      data.updatePet(petId, form as Partial<Pet>);
    } else {
      const pet: Pet = {
        id: uuid(),
        name: form.name!.trim(),
        species: form.species ?? 'dog',
        breed: form.breed,
        dateOfBirth: form.dateOfBirth!,
        microchipNumber: form.microchipNumber,
        color: form.color,
        avatarEmoji: form.avatarEmoji,
        vaccinations: form.vaccinations ?? [],
        createdAt: new Date().toISOString(),
        vetName: form.vetName,
        vetPhone: form.vetPhone,
        vetClinic: form.vetClinic,
      };
      data.addPet(pet);
    }
    navigate('/pets');
  }

  const steps = [
    { label: 'Basic Info',     icon: '🐾' },
    { label: 'Vaccinations',   icon: '💉' },
    { label: 'Vet & More',     icon: '🏥' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/pets')} style={{
          background: Colors.navyLight, border: 'none', borderRadius: 10,
          padding: '8px 12px', cursor: 'pointer', color: Colors.creammid, fontSize: 14,
        }}>← Back</button>
        <h1 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif" }}>
          {isEdit ? `Edit ${editingPet?.name}` : 'Add Pet'}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 10,
            border: `1px solid ${i === step ? Colors.teal : Colors.border}`,
            background: i === step ? Colors.tealGlow : Colors.navyMid,
            color: i === step ? Colors.teal : Colors.creammid,
            fontWeight: i === step ? 700 : 400, fontSize: 12, cursor: 'pointer',
          }}>{s.icon} {s.label}</button>
        ))}
      </div>

      {error && (
        <div style={{ background: Colors.redBg, color: Colors.red, padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {step === 0 && (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <FLabel>Avatar</FLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PET_EMOJIS.map(e => (
                <button key={e} onClick={() => update('avatarEmoji', e)} style={{
                  fontSize: 26, width: 44, height: 44, borderRadius: 10,
                  border: `2px solid ${form.avatarEmoji === e ? Colors.teal : Colors.border}`,
                  background: form.avatarEmoji === e ? Colors.tealGlow : Colors.navyLight, cursor: 'pointer',
                }}>{e}</button>
              ))}
            </div>
          </div>
          <FField label="Pet Name *"        value={form.name ?? ''}            onChange={v => update('name', v)} placeholder="Buddy" />
          <div style={{ marginBottom: 16 }}>
            <FLabel>Species *</FLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['dog','cat'] as const).map(s => (
                <button key={s} onClick={() => update('species', s)} style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: `2px solid ${form.species === s ? Colors.teal : Colors.border}`,
                  background: form.species === s ? Colors.tealGlow : Colors.navyLight,
                  color: form.species === s ? Colors.teal : Colors.cream,
                  fontWeight: 600, cursor: 'pointer', fontSize: 15,
                }}>{s === 'dog' ? '🐶 Dog' : '🐱 Cat'}</button>
              ))}
            </div>
          </div>
          <FField label="Breed"             value={form.breed ?? ''}           onChange={v => update('breed', v)}           placeholder="Golden Retriever" />
          <FField label="Date of Birth *"   value={form.dateOfBirth ?? ''}     onChange={v => update('dateOfBirth', v)}     type="date" />
          <FField label="Microchip Number"  value={form.microchipNumber ?? ''} onChange={v => update('microchipNumber', v)} placeholder="15-digit ISO number" />
          <FField label="Colour / Markings" value={form.color ?? ''}           onChange={v => update('color', v)}           placeholder="Golden" />
        </Card>
      )}

      {step === 1 && (
        <Card>
          <p style={{ fontSize: 13, color: Colors.creammid, marginBottom: 16, lineHeight: 1.5 }}>
            Add vaccination records to automatically tick vaccination items in your trip checklists.
          </p>
          {(form.vaccinations ?? []).map((v: VaccinationRecord) => (
            <div key={v.id} style={{
              background: Colors.greenBg, border: `1px solid ${Colors.green}22`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>💉 {v.vaccineName}</div>
                <div style={{ fontSize: 12, color: Colors.creammid }}>
                  Given: {v.dateAdministered}{v.nextDueDate ? ` · Due: ${v.nextDueDate}` : ''}
                </div>
              </div>
              <button onClick={() => removeVacc(v.id)} style={{ color: Colors.red, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
          ))}
          <div style={{ background: Colors.navyLight, borderRadius: 12, padding: 16, marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>+ Add Vaccination</div>
            <FField label="Vaccine Name" value={newVacc.name} onChange={v => setNewVacc(p => ({ ...p, name: v }))} placeholder="e.g. Rabies, DHPP" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FField label="Date Given" value={newVacc.dateAdmin} onChange={v => setNewVacc(p => ({ ...p, dateAdmin: v }))} type="date" />
              <FField label="Next Due"   value={newVacc.nextDue}   onChange={v => setNewVacc(p => ({ ...p, nextDue: v }))}   type="date" />
            </div>
            <button onClick={addVaccination} style={{
              width: '100%', padding: '10px', borderRadius: 10,
              background: Colors.teal, color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 4,
            }}>Add Record</button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <p style={{ fontSize: 13, color: Colors.creammid, marginBottom: 16 }}>Optional — used for Travel Pack exports and reference.</p>
          <FField label="Veterinarian Name" value={form.vetName ?? ''}   onChange={v => update('vetName', v)}   placeholder="Dr. Jane Smith" />
          <FField label="Clinic Name"       value={form.vetClinic ?? ''} onChange={v => update('vetClinic', v)} placeholder="Happy Paws Veterinary" />
          <FField label="Vet Phone"         value={form.vetPhone ?? ''}  onChange={v => update('vetPhone', v)}  placeholder="+1 555 123 4567" type="tel" />
        </Card>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{
            flex: 1, padding: '14px', borderRadius: 14,
            border: `1px solid ${Colors.border}`, background: Colors.navyMid,
            fontWeight: 600, cursor: 'pointer', color: Colors.cream,
          }}>← Back</button>
        )}
        {step < steps.length - 1 ? (
          <button onClick={() => { setError(''); setStep(s => s + 1); }} style={{
            flex: 2, padding: '14px', borderRadius: 14,
            background: Colors.teal, color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>Next →</button>
        ) : (
          <button onClick={handleSave} style={{
            flex: 2, padding: '14px', borderRadius: 14,
            background: Colors.teal, color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>{isEdit ? '✅ Save Changes' : '🐾 Save Pet'}</button>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: Colors.navyMid, border: `1px solid ${Colors.border}`, borderRadius: 18, padding: 20, boxShadow: `0 2px 10px ${Colors.shadow}` }}>
      {children}
    </div>
  );
}

function FLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: Colors.creammid, marginBottom: 6 }}>{children}</label>;
}

function FField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <FLabel>{label}</FLabel>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={{
        width: '100%', padding: '11px 13px', borderRadius: 10,
        border: `1px solid ${Colors.border}`, background: Colors.navyLight,
        fontSize: 14, color: Colors.cream,
      }} />
    </div>
  );
}
