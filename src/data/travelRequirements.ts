// ─────────────────────────────────────────────────────────────────────────────
// PetRoam – Travel Requirements Engine
// Sources: CDC (US), CFIA (CA), European Commission (EU),
//          DAFF/BICON (AU), MPI (NZ), MAFF/AQS (JP)
// ─────────────────────────────────────────────────────────────────────────────

export type DestinationCountry = 'US' | 'CA' | 'EU' | 'AU' | 'NZ' | 'JP';
export type PetType = 'dog' | 'cat';

export interface Country {
  code: string;
  name: string;
  region: 'rabies_free' | 'low_risk' | 'high_risk';
}

export const COUNTRIES: Country[] = [
  { code: 'AU', name: 'Australia',       region: 'rabies_free' },
  { code: 'NZ', name: 'New Zealand',     region: 'rabies_free' },
  { code: 'JP', name: 'Japan',           region: 'rabies_free' },
  { code: 'SG', name: 'Singapore',       region: 'rabies_free' },
  { code: 'GB', name: 'United Kingdom',  region: 'low_risk'    },
  { code: 'DE', name: 'Germany',         region: 'low_risk'    },
  { code: 'FR', name: 'France',          region: 'low_risk'    },
  { code: 'IT', name: 'Italy',           region: 'low_risk'    },
  { code: 'ES', name: 'Spain',           region: 'low_risk'    },
  { code: 'NL', name: 'Netherlands',     region: 'low_risk'    },
  { code: 'BE', name: 'Belgium',         region: 'low_risk'    },
  { code: 'AT', name: 'Austria',         region: 'low_risk'    },
  { code: 'CH', name: 'Switzerland',     region: 'low_risk'    },
  { code: 'SE', name: 'Sweden',          region: 'low_risk'    },
  { code: 'NO', name: 'Norway',          region: 'low_risk'    },
  { code: 'DK', name: 'Denmark',         region: 'low_risk'    },
  { code: 'FI', name: 'Finland',         region: 'low_risk'    },
  { code: 'IE', name: 'Ireland',         region: 'low_risk'    },
  { code: 'PT', name: 'Portugal',        region: 'low_risk'    },
  { code: 'CA', name: 'Canada',          region: 'low_risk'    },
  { code: 'US', name: 'United States',   region: 'low_risk'    },
  { code: 'IN', name: 'India',           region: 'high_risk'   },
  { code: 'CN', name: 'China',           region: 'high_risk'   },
  { code: 'PH', name: 'Philippines',     region: 'high_risk'   },
  { code: 'ID', name: 'Indonesia',       region: 'high_risk'   },
  { code: 'TH', name: 'Thailand',        region: 'high_risk'   },
  { code: 'VN', name: 'Vietnam',         region: 'high_risk'   },
  { code: 'PK', name: 'Pakistan',        region: 'high_risk'   },
  { code: 'BD', name: 'Bangladesh',      region: 'high_risk'   },
  { code: 'BR', name: 'Brazil',          region: 'high_risk'   },
  { code: 'MX', name: 'Mexico',          region: 'high_risk'   },
  { code: 'EG', name: 'Egypt',           region: 'high_risk'   },
  { code: 'NG', name: 'Nigeria',         region: 'high_risk'   },
  { code: 'ZA', name: 'South Africa',    region: 'high_risk'   },
  { code: 'RU', name: 'Russia',          region: 'high_risk'   },
  { code: 'UA', name: 'Ukraine',         region: 'high_risk'   },
  { code: 'TR', name: 'Turkey',          region: 'high_risk'   },
  { code: 'MA', name: 'Morocco',         region: 'high_risk'   },
  { code: 'KE', name: 'Kenya',           region: 'high_risk'   },
  { code: 'ET', name: 'Ethiopia',        region: 'high_risk'   },
  { code: 'AE', name: 'UAE',             region: 'high_risk'   },
  { code: 'SA', name: 'Saudi Arabia',    region: 'high_risk'   },
  { code: 'QA', name: 'Qatar',           region: 'high_risk'   },
  { code: 'KR', name: 'South Korea',     region: 'low_risk'    },
  { code: 'HK', name: 'Hong Kong',       region: 'rabies_free' },
  { code: 'TW', name: 'Taiwan',          region: 'rabies_free' },
  { code: 'MY', name: 'Malaysia',        region: 'high_risk'   },
  { code: 'LK', name: 'Sri Lanka',       region: 'high_risk'   },
  { code: 'NP', name: 'Nepal',           region: 'high_risk'   },
];

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  daysBeforeTravel: number | null;
  daysWindow?: number;
  mandatory: boolean;
  category: 'document' | 'vaccination' | 'health' | 'booking' | 'microchip' | 'form';
  officialSource: string;
  completed: boolean;
  completedDate?: string;
  notEligible?: boolean;
}

export interface TravelScenario {
  id: string;
  label: string;
  color: string;
  emoji: string;
  summary: string;
  checklist: ChecklistItem[];
}

// ════════════════════════════════════════════════════════════════════════════
// UNITED STATES – CDC rules (effective Aug 1, 2024)
// ════════════════════════════════════════════════════════════════════════════
export function getUSScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  isUSVaccinated: boolean,
  petType: PetType = 'dog',
): TravelScenario {

  if (petType === 'cat') {
    return {
      id: 'us_cat', label: 'Cat to United States', color: '#22c55e', emoji: '🐱',
      summary: 'Cats entering the US have minimal requirements. No CDC import form required. Must appear healthy at the border.',
      checklist: [
        { id: 'us_cat_healthy', title: 'Cat must appear healthy on arrival', description: 'CBP/CDC officers may deny entry to cats showing signs of illness.', daysBeforeTravel: null, mandatory: true, category: 'health', officialSource: 'https://www.cdc.gov/importation/cats/index.html', completed: false },
        { id: 'us_cat_rabies_rec', title: 'Rabies vaccination (strongly recommended)', description: 'Not legally required by US, but required by many airlines, states and boarding facilities.', daysBeforeTravel: null, mandatory: false, category: 'vaccination', officialSource: 'https://www.cdc.gov/importation/cats/index.html', completed: false },
        { id: 'us_cat_health_cert_rec', title: 'Veterinary health certificate (recommended)', description: 'Airlines typically require a health certificate issued within 10 days of travel for in-cabin or checked pets.', daysBeforeTravel: 10, daysWindow: 10, mandatory: false, category: 'document', officialSource: 'https://www.cdc.gov/importation/cats/index.html', completed: false },
        { id: 'us_cat_microchip_rec', title: 'Microchip (ISO 11784/11785) recommended', description: 'Not required for US entry but essential for identification and required by many airlines.', daysBeforeTravel: null, mandatory: false, category: 'microchip', officialSource: 'https://www.cdc.gov/importation/cats/index.html', completed: false },
      ],
    };
  }

  const universalItems: ChecklistItem[] = [
    { id: 'us_age', title: 'Dog must be at least 6 months old', description: 'CDC requires every dog entering the US to be ≥6 months old.', daysBeforeTravel: null, mandatory: true, category: 'health', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
    { id: 'us_microchip', title: 'ISO-compatible microchip implanted', description: 'Must comply with ISO 11784/11785 and be implanted BEFORE any rabies vaccination.', daysBeforeTravel: null, mandatory: true, category: 'microchip', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
    { id: 'us_healthy', title: 'Dog must appear healthy on arrival', description: 'Dogs showing signs of illness may be denied entry or held for inspection.', daysBeforeTravel: null, mandatory: true, category: 'health', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
    { id: 'us_cdc_form', title: 'Complete CDC Dog Import Form online', description: 'Free online form at cdc.gov. Receipt valid for 6 months. Can be shown on phone.', daysBeforeTravel: 7, mandatory: true, category: 'form', officialSource: 'https://www.cdc.gov/importation/dogs/dog-import-form-instructions.html', completed: false },
  ];

  if (originRisk === 'rabies_free' || originRisk === 'low_risk') {
    return {
      id: 'us_scenario_1', label: 'Low-Risk Country', color: '#22c55e', emoji: '🟢',
      summary: 'Simplest path — only the CDC Dog Import Form required. Rabies vaccine strongly recommended but not mandatory.',
      checklist: [
        ...universalItems,
        { id: 'us_rabies_rec', title: 'Rabies vaccination (recommended)', description: 'Not legally required from low/no-risk countries, but strongly recommended by CDC.', daysBeforeTravel: null, mandatory: false, category: 'vaccination', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
      ],
    };
  }

  if (isUSVaccinated) {
    return {
      id: 'us_scenario_3', label: 'US-Vaccinated Returning', color: '#3b82f6', emoji: '🔵',
      summary: 'US-vaccinated dog returning from a high-risk country. Needs CDC form + USDA-endorsed US Rabies Vaccination Certificate.',
      checklist: [
        ...universalItems,
        { id: 'us_rabies_vacc_us', title: 'Valid US-issued rabies vaccination', description: 'Must have been vaccinated in the US by a licensed veterinarian.', daysBeforeTravel: null, mandatory: true, category: 'vaccination', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
        { id: 'us_cert_us_vacc', title: 'Certification of US-Issued Rabies Vaccination form', description: 'Completed by a USDA-accredited vet and USDA-endorsed BEFORE leaving the US.', daysBeforeTravel: 30, mandatory: true, category: 'document', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
      ],
    };
  }

  return {
    id: 'us_scenario_2', label: 'High-Risk Country (Foreign Vaccinated)', color: '#ef4444', emoji: '🔴',
    summary: 'Most demanding path. Requires foreign vaccination cert, CDC-approved titer test ≥0.5 IU/mL, and booking at a CDC-registered animal care facility.',
    checklist: [
      ...universalItems,
      { id: 'us_rabies_vacc_foreign', title: 'Rabies vaccination (foreign)', description: 'Dog must be vaccinated against rabies by a licensed vet in the origin country.', daysBeforeTravel: 60, mandatory: true, category: 'vaccination', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
      { id: 'us_cert_foreign_vacc', title: 'Certification of Foreign Rabies Vaccination & Microchip form', description: 'Completed by your vet AND endorsed by an official government veterinarian in origin country.', daysBeforeTravel: 45, mandatory: true, category: 'document', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
      { id: 'us_titer_blood_draw', title: 'Blood draw for rabies titer test', description: "Must be drawn at least 30 days AFTER the dog's first rabies vaccination. Use a CDC-approved laboratory.", daysBeforeTravel: 90, daysWindow: 30, mandatory: true, category: 'health', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
      { id: 'us_titer_results', title: 'Titer test results ≥ 0.5 IU/mL received', description: 'Passing result must be received at least 28 days before US entry.', daysBeforeTravel: 28, mandatory: true, category: 'document', officialSource: 'https://www.cdc.gov/importation/dogs/index.html', completed: false },
      { id: 'us_cdc_facility_booking', title: 'Book CDC-registered animal care facility', description: 'Required reservation. Entry ONLY at airports with CDC-registered facility.', daysBeforeTravel: 60, mandatory: true, category: 'booking', officialSource: 'https://www.cdc.gov/importation/dogs/approved-care-facilities.html', completed: false },
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// CANADA – CFIA rules
// ════════════════════════════════════════════════════════════════════════════
export function getCAScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  petType: PetType,
): TravelScenario {
  if (petType === 'cat') {
    return {
      id: 'ca_cat', label: 'Cat to Canada', color: '#22c55e', emoji: '🐱',
      summary: 'Cats entering Canada have minimal requirements — no rabies vaccination or health certificate is federally required.',
      checklist: [
        { id: 'ca_cat_healthy', title: 'Cat must appear healthy', description: 'CFIA officers may deny entry to cats showing signs of disease.', daysBeforeTravel: null, mandatory: true, category: 'health', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
        { id: 'ca_cat_rabies_rec', title: 'Rabies vaccination (recommended)', description: 'Not federally required for cats entering Canada, but strongly recommended.', daysBeforeTravel: null, mandatory: false, category: 'vaccination', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
        { id: 'ca_cat_health_cert', title: 'Veterinary health certificate (airline requirement)', description: 'Not required by CFIA but most airlines require it within 10 days of travel.', daysBeforeTravel: 10, daysWindow: 10, mandatory: false, category: 'document', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
      ],
    };
  }

  if (originRisk === 'rabies_free' || originRisk === 'low_risk') {
    return {
      id: 'ca_dog_low', label: 'Dog to Canada – Low Risk', color: '#22c55e', emoji: '🟢',
      summary: 'Dogs from rabies-free or low-risk countries need a valid rabies vaccination certificate signed by a licensed vet.',
      checklist: [
        { id: 'ca_dog_healthy', title: 'Dog must appear healthy', description: 'CFIA officers can deny entry to dogs showing signs of disease.', daysBeforeTravel: null, mandatory: true, category: 'health', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
        { id: 'ca_rabies_cert', title: 'Rabies vaccination certificate', description: 'Valid certificate signed by a licensed veterinarian. Must not have expired.', daysBeforeTravel: null, mandatory: true, category: 'vaccination', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
      ],
    };
  }

  return {
    id: 'ca_dog_high', label: 'Dog to Canada – High Risk', color: '#f97316', emoji: '🟠',
    summary: 'Dogs from high-risk countries require a valid rabies vaccination certificate AND a veterinary health certificate.',
    checklist: [
      { id: 'ca_dog_healthy_hr', title: 'Dog must appear healthy', description: 'CFIA officers can deny entry to dogs showing signs of disease.', daysBeforeTravel: null, mandatory: true, category: 'health', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
      { id: 'ca_rabies_cert_hr', title: 'Rabies vaccination certificate', description: 'Valid certificate signed by a licensed veterinarian.', daysBeforeTravel: null, mandatory: true, category: 'vaccination', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
      { id: 'ca_health_cert', title: 'Veterinary health certificate (within 10 days)', description: 'Official health certificate issued by an accredited veterinarian within 10 days of travel.', daysBeforeTravel: 10, daysWindow: 10, mandatory: true, category: 'document', officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports', completed: false },
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// EUROPEAN UNION – European Commission rules
// ════════════════════════════════════════════════════════════════════════════
export function getEUScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  petType: PetType,
): TravelScenario {
  const euBase: ChecklistItem[] = [
    { id: 'eu_microchip', title: 'ISO microchip (15-digit)', description: 'Mandatory for all pets entering the EU. Must be implanted before rabies vaccination.', daysBeforeTravel: null, mandatory: true, category: 'microchip', officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en', completed: false },
    { id: 'eu_rabies_vacc', title: 'Rabies vaccination up-to-date', description: 'Must be administered after microchip. First vaccine requires 21-day wait before entry.', daysBeforeTravel: 21, mandatory: true, category: 'vaccination', officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en', completed: false },
    { id: 'eu_health_cert', title: 'EU health certificate or EU pet passport', description: 'Issued by an official vet within 10 days of travel.', daysBeforeTravel: 10, daysWindow: 10, mandatory: true, category: 'document', officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en', completed: false },
  ];

  if (originRisk === 'high_risk') {
    return {
      id: `eu_high_risk_${petType}`, label: `EU Entry – High Risk (${petType === 'cat' ? 'Cat' : 'Dog'})`, color: '#ef4444', emoji: petType === 'cat' ? '🐱' : '🔴',
      summary: petType === 'cat' ? 'Cats from high-risk countries require microchip, rabies vaccination, titer test ≥0.5 IU/mL, and EU health certificate.' : 'High-risk origin requires microchip, rabies vaccination, titer test, and health certificate.',
      checklist: [
        ...euBase,
        { id: 'eu_titer', title: 'Rabies antibody titer test ≥ 0.5 IU/mL', description: 'Blood sample at least 30 days after vaccination. Results needed 3 months before entry.', daysBeforeTravel: 90, mandatory: true, category: 'health', officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en', completed: false },
        ...(petType === 'dog' ? [{ id: 'eu_tapeworm', title: 'Tapeworm treatment (dogs only)', description: 'Some EU member states require Echinococcus treatment 1–5 days before entry. Cats exempt.', daysBeforeTravel: 3, daysWindow: 4, mandatory: true, category: 'health' as const, officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en', completed: false }] : []),
      ],
    };
  }

  return {
    id: `eu_low_risk_${petType}`, label: `EU Entry – Low/No Risk (${petType === 'cat' ? 'Cat' : 'Dog'})`, color: '#22c55e', emoji: petType === 'cat' ? '🐱' : '🟢',
    summary: petType === 'cat' ? 'Cats from listed countries need microchip, valid rabies vaccination and EU health certificate. No titer test required.' : 'Pets from listed countries need microchip, valid rabies vaccination and a health certificate. No titer test required.',
    checklist: [
      ...euBase,
      ...(petType === 'dog' ? [{ id: 'eu_tapeworm_optional', title: 'Tapeworm treatment (if entering specific countries) — dogs only', description: 'Required when entering Finland, Ireland, Malta, Norway, or the UK. Not required for cats.', daysBeforeTravel: 3, daysWindow: 4, mandatory: false, category: 'health' as const, officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en', completed: false }] : []),
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// AUSTRALIA – DAFF / BICON rules (verified 2025)
// Source: agriculture.gov.au, bicon.agriculture.gov.au
// ════════════════════════════════════════════════════════════════════════════
export function getAUScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  petType: PetType,
): TravelScenario {
  const base: ChecklistItem[] = [
    { id: 'au_microchip', title: 'ISO microchip (BEFORE vaccinations)', description: 'Mandatory. 15-digit ISO 11784/11785. Must be implanted before any rabies vaccination — wrong order invalidates the vaccination entirely.', daysBeforeTravel: null, mandatory: true, category: 'microchip', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs', completed: false },
    { id: 'au_rabies_vacc', title: 'Rabies vaccination (after microchip)', description: 'Must be administered AFTER microchip. Primary course and valid booster required.', daysBeforeTravel: originRisk === 'rabies_free' ? 60 : 210, mandatory: true, category: 'vaccination', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs', completed: false },
    { id: 'au_titer', title: 'Rabies antibody titer test (RNATT) ≥ 0.5 IU/mL', description: originRisk === 'rabies_free' ? 'Blood drawn at least 30 days after vaccination. Group 2 (rabies-free) countries have a reduced wait period — confirm exact timing with DAFF.' : 'Blood drawn at least 30 days after vaccination. Must wait 180 days from blood draw date before entry into Australia.', daysBeforeTravel: originRisk === 'rabies_free' ? 30 : 210, mandatory: true, category: 'health', officialSource: 'https://bicon.agriculture.gov.au', completed: false },
    { id: 'au_identity_verify', title: 'Identity verification by competent authority', description: 'Government authority must verify your pet\'s identity and send a copy directly to DAFF. Required before applying for import permit.', daysBeforeTravel: 90, mandatory: true, category: 'document', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs/how-to-import/permit', completed: false },
    { id: 'au_permit', title: 'Import Permit via BICON (apply ≥ 60 days ahead)', description: 'Apply at bicon.agriculture.gov.au. Takes 10–20 business days. Fee: AUD $480 first pet, $240 each additional. Do NOT book flights until permit is confirmed — it specifies your required entry port.', daysBeforeTravel: 60, mandatory: true, category: 'document', officialSource: 'https://bicon.agriculture.gov.au', completed: false },
    { id: 'au_health_cert', title: 'Official export health certificate (within 10 days)', description: 'Issued by a government-accredited vet and endorsed by official authority (e.g. USDA APHIS). Must be completed within 10 days of travel.', daysBeforeTravel: 10, daysWindow: 10, mandatory: true, category: 'document', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs', completed: false },
    { id: 'au_parasite_1', title: 'Parasite treatment #1 (14 days before export)', description: 'First of two mandatory treatments for fleas, ticks and Echinococcus tapeworm. Must be recorded on health certificate.', daysBeforeTravel: 14, daysWindow: 3, mandatory: true, category: 'health', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs', completed: false },
    { id: 'au_parasite_2', title: 'Parasite treatment #2 (5 days before export)', description: 'Second mandatory parasite treatment 5 days before export. Both treatments must be documented.', daysBeforeTravel: 5, daysWindow: 3, mandatory: true, category: 'health', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs', completed: false },
    { id: 'au_quarantine', title: 'Book 10-day quarantine at Mickleham (before permit)', description: 'All pets must complete 10 days at the PEQ facility in Mickleham, Victoria. Cost from AUD ~$2,000. Must be booked BEFORE applying for import permit.', daysBeforeTravel: 90, mandatory: true, category: 'booking', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs/approved-countries', completed: false },
  ];

  const dogExtra: ChecklistItem[] = petType === 'dog' ? [
    { id: 'au_dog_combo_vacc', title: 'Core combination vaccine (dogs only — DHPP)', description: 'Dogs must also be vaccinated against distemper, hepatitis, parvovirus and parainfluenza. Vaccine must be valid through the quarantine period.', daysBeforeTravel: 30, mandatory: true, category: 'vaccination', officialSource: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs', completed: false },
  ] : [];

  return {
    id: `au_${originRisk}_${petType}`,
    label: originRisk === 'rabies_free' ? 'Australia – Group 2 (Rabies-Free Country)' : 'Australia – Group 3 (Standard Pathway)',
    color: originRisk === 'rabies_free' ? '#22c55e' : '#f97316',
    emoji: '🦘',
    summary: originRisk === 'rabies_free'
      ? 'Pets from designated rabies-free countries (Group 2: NZ, Japan, Singapore, UK etc.) have a shorter titer test waiting period. 10-day quarantine at Mickleham still required. Plan 4–6 months ahead.'
      : 'Australia has some of the world\'s strictest biosecurity. 180-day wait after titer blood draw means preparation takes 7–12 months. All pets must complete 10-day quarantine at Mickleham, Victoria.',
    checklist: [...base, ...dogExtra],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// NEW ZEALAND – MPI import rules (verified 2025)
// Source: mpi.govt.nz, aphis.usda.gov
// ════════════════════════════════════════════════════════════════════════════
export function getNZScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  petType: PetType,
): TravelScenario {
  const base: ChecklistItem[] = [
    { id: 'nz_microchip', title: 'ISO microchip (BEFORE vaccinations)', description: 'Mandatory. ISO 11784/11785, 15-digit. Must be implanted before any rabies vaccination. Avoid codes starting with 999.', daysBeforeTravel: null, mandatory: true, category: 'microchip', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
    { id: 'nz_rabies_vacc', title: 'Rabies vaccination (2 doses required)', description: 'Primary + booster. First dose must be at least 30 days before titer blood draw. Booster must remain valid through travel.', daysBeforeTravel: 240, mandatory: true, category: 'vaccination', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
    { id: 'nz_titer', title: 'Rabies antibody titer test (FAVN) ≥ 0.5 IU/mL', description: originRisk === 'rabies_free' ? 'May be required depending on your specific country category — confirm with MPI. Shorter wait applies for some designated countries.' : 'Blood drawn at least 30 days after vaccination. Must wait 180 days after passing before entry. If test fails: re-vaccinate and retest.', daysBeforeTravel: originRisk === 'rabies_free' ? 90 : 210, mandatory: originRisk !== 'rabies_free', category: 'health', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false, notEligible: false },
    { id: 'nz_permit', title: 'MPI Import Permit (apply ≥ 20 working days ahead)', description: 'Apply to MPI with quarantine booking confirmation and veterinary paperwork. Valid 12 months or until titer test expires. Submit to animalimports@mpi.govt.nz.', daysBeforeTravel: 60, mandatory: true, category: 'document', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
    { id: 'nz_health_cert', title: 'Official health certificates A and B (within 10 days)', description: 'Health Certificate A and B, issued and endorsed by official veterinary authority. Must be completed within 10 days of travel.', daysBeforeTravel: 10, daysWindow: 10, mandatory: true, category: 'document', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
    { id: 'nz_parasite_treat', title: 'Pre-export parasite treatment (twice — Drontal only)', description: 'Must be treated twice by a Government-Accredited Vet. Only Drontal (praziquantel) is accepted as dewormer for NZ. Tick treatment also required.', daysBeforeTravel: 5, daysWindow: 4, mandatory: true, category: 'health', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
    { id: 'nz_quarantine', title: 'Book 10-day quarantine (Auckland or Christchurch only)', description: 'All pets must complete 10-day quarantine at an MPI-approved facility. ONLY available at Auckland or Christchurch — pet MUST fly directly to one of these cities.', daysBeforeTravel: 90, mandatory: true, category: 'booking', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
  ];

  const dogExtra: ChecklistItem[] = petType === 'dog' ? [
    { id: 'nz_heartworm', title: 'Heartworm antigen test (within 30 days) — dogs only', description: 'ELISA test for heartworm antigen within 30 days before export. Must return negative.', daysBeforeTravel: 30, mandatory: true, category: 'health', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
    { id: 'nz_babesia', title: 'Babesia gibsoni test (within 16 days) — dogs only', description: 'IFA or ELISA test for Babesia gibsoni within 16 days before export. Must return negative.', daysBeforeTravel: 16, mandatory: true, category: 'health', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
    { id: 'nz_brucella', title: 'Brucella canis test — dogs only', description: 'RSAT test for Brucella canis before export. Must return negative.', daysBeforeTravel: 30, mandatory: true, category: 'health', officialSource: 'https://www.mpi.govt.nz/travel-and-trade/bringing-cats-and-dogs-to-new-zealand', completed: false },
  ] : [];

  return {
    id: `nz_${originRisk}_${petType}`, label: 'New Zealand Import', color: '#10b981', emoji: '🥝',
    summary: originRisk === 'rabies_free'
      ? 'Pets from designated rabies-free countries have a shorter titer test wait. 10-day quarantine at Auckland or Christchurch still required. Plan at least 4–6 months ahead.'
      : 'NZ has strict biosecurity. 180-day wait after titer blood draw. Pets arrive only at Auckland or Christchurch. Start preparation 8–12 months before travel.',
    checklist: [...base, ...dogExtra],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// JAPAN – MAFF / AQS rules (verified 2025)
// Source: maff.go.jp/aqs/english, aphis.usda.gov
// ════════════════════════════════════════════════════════════════════════════
export function getJPScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  petType: PetType,
): TravelScenario {
  const base: ChecklistItem[] = [
    { id: 'jp_microchip', title: 'ISO microchip (BEFORE vaccinations)', description: 'Mandatory. ISO 11784/11785, 15-digit (numbers only). Must be implanted on the day of or before the first rabies vaccination. Wrong order = restart entire process.', daysBeforeTravel: null, mandatory: true, category: 'microchip', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/index.html', completed: false },
    { id: 'jp_rabies_vacc_1', title: 'Rabies vaccination #1 (primary)', description: 'First rabies vaccination given AFTER microchip. For designated (rabies-free) countries one valid vaccination may suffice.', daysBeforeTravel: originRisk === 'rabies_free' ? 90 : 240, mandatory: true, category: 'vaccination', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/index.html', completed: false },
    { id: 'jp_rabies_vacc_2', title: 'Rabies vaccination #2 (booster, non-designated countries)', description: 'Second vaccination at least 30 days after the first. Required for non-designated countries. Must be given before the titer test blood draw.', daysBeforeTravel: 210, mandatory: originRisk !== 'rabies_free', category: 'vaccination', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/index.html', completed: false, notEligible: originRisk === 'rabies_free' },
    { id: 'jp_titer', title: 'Rabies antibody titer test (FAVN) ≥ 0.5 IU/mL', description: 'CRITICAL: Must wait 180 days from blood draw date before arriving in Japan. Blood drawn at a MAFF-approved lab, at least 30 days after final vaccination. Early arrival = quarantine for remaining days at your expense.', daysBeforeTravel: 210, mandatory: originRisk !== 'rabies_free', category: 'health', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/index.html', completed: false, notEligible: originRisk === 'rabies_free' },
    { id: 'jp_advance_notice', title: 'Advance notification to AQS (≥ 40 days before arrival)', description: 'Submit advance notice to Japan Animal Quarantine Service at least 40 days before arrival. Include microchip number, vaccination history, titer results and travel plans. Via fax or postal mail.', daysBeforeTravel: 40, mandatory: true, category: 'document', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/index.html', completed: false },
    { id: 'jp_health_cert', title: 'Official health certificate in MAFF format (within 10 days)', description: 'Must be in MAFF-specified format, issued by an accredited government vet and endorsed by the official authority. Completed within 10 days of travel.', daysBeforeTravel: 10, daysWindow: 10, mandatory: true, category: 'document', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/index.html', completed: false },
    { id: 'jp_entry_ports', title: 'Confirm approved entry port (dogs only)', description: 'Dogs can only enter through approved airports: Narita, Haneda, Kansai, Chubu International. Cats have no port restriction.', daysBeforeTravel: 60, mandatory: petType === 'dog', category: 'booking', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/index.html', completed: false },
    { id: 'jp_quarantine', title: 'Post-arrival inspection (12 hrs if compliant / up to 180 days if not)', description: 'If ALL requirements met and 180 days passed since titer blood draw: ≤12 hour inspection. Any missing requirement or <180 days elapsed: quarantine for remaining days at Animal Quarantine Station at your full expense.', daysBeforeTravel: 30, mandatory: true, category: 'booking', officialSource: 'https://www.maff.go.jp/aqs/english/animal/dog/quarantine/index.html', completed: false },
  ];

  return {
    id: `jp_${originRisk}_${petType}`,
    label: originRisk === 'rabies_free' ? 'Japan – Designated (Rabies-Free) Country' : 'Japan – Non-Designated Country',
    color: originRisk === 'rabies_free' ? '#ec4899' : '#ef4444',
    emoji: '🗾',
    summary: originRisk === 'rabies_free'
      ? 'Pets from MAFF-designated rabies-free regions (UK, Australia, NZ, Singapore, Hawaii, Guam etc.) can qualify for <12-hour inspection. No titer test required, but vaccination, microchip, 40-day advance notice and health cert are still mandatory. Start preparation at least 4–6 months ahead.'
      : 'Japan\'s requirements are among the strictest globally. Two rabies vaccinations, titer test, and mandatory 180-day wait from blood draw date are required. Missing any step or arriving early results in up to 180 days of costly quarantine. Start preparation 7–12 months before travel.',
    checklist: base,
  };
}

// ── Master factory ────────────────────────────────────────────────────────────
export function applyPetProfileToChecklist(
  checklist: ChecklistItem[],
  dateOfBirth: string,
  microchipNumber: string | undefined,
  travelDate: Date,
): ChecklistItem[] {
  const microchipIds = ['us_microchip', 'eu_microchip', 'ca_microchip', 'au_microchip', 'nz_microchip', 'jp_microchip'];
  const ageIds       = ['us_age'];

  return checklist.map(item => {
    // Auto-tick microchip if number provided
    if (microchipIds.includes(item.id) && microchipNumber?.trim()) {
      return { ...item, completed: true };
    }

    // Age eligibility (US: must be ≥6 months)
    if (ageIds.includes(item.id) && dateOfBirth) {
      try {
        const dob        = new Date(dateOfBirth);
        const ageAtTravel = (travelDate.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
        if (ageAtTravel < 6) {
          return { ...item, notEligible: true, completed: false };
        }
        return { ...item, completed: true, notEligible: false };
      } catch { /* ignore invalid date */ }
    }

    return item;
  });
}

export function buildTravelScenario(params: {
  destination: DestinationCountry;
  originCountryCode: string;
  petType: PetType;
  isUSVaccinated?: boolean;
}): TravelScenario {
  const origin = COUNTRIES.find(c => c.code === params.originCountryCode);
  const risk   = origin?.region ?? 'high_risk';

  switch (params.destination) {
    case 'US': return getUSScenario(risk, params.isUSVaccinated ?? false, params.petType);
    case 'CA': return getCAScenario(risk, params.petType);
    case 'EU': return getEUScenario(risk, params.petType);
    case 'AU': return getAUScenario(risk, params.petType);
    case 'NZ': return getNZScenario(risk, params.petType);
    case 'JP': return getJPScenario(risk, params.petType);
  }
}
