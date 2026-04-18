// ─────────────────────────────────────────────────────────────────────────────
// PetRoam – Travel Requirements Engine
// All rules are sourced from official government portals:
//   US  → CDC (effective Aug 1 2024)
//   CA  → CFIA
//   EU  → European Commission
// ─────────────────────────────────────────────────────────────────────────────

export type DestinationCountry = 'US' | 'CA' | 'EU';
export type PetType = 'dog' | 'cat';

export interface Country {
  code: string;
  name: string;
  region: 'rabies_free' | 'low_risk' | 'high_risk';
}

// ── Rabies-risk country classification (CDC / WOAH data) ──────────────────────
export const COUNTRIES: Country[] = [
  // Rabies-free / low-risk
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
  // High-risk
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
];

// ── Checklist item types ──────────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  daysBeforeTravel: number | null; // null = anytime / ongoing
  daysWindow?: number;             // optional: must be done within X days
  mandatory: boolean;
  category: 'document' | 'vaccination' | 'health' | 'booking' | 'microchip' | 'form';
  officialSource: string;
  completed: boolean;          // always initialised to false in item literals
  completedDate?: string;
  notEligible?: boolean;       // set by applyPetProfileToChecklist when pet is ineligible (e.g. underage)
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
// UNITED STATES – import rules (CDC, effective Aug 1 2024)
// Dogs: complex tiered rules  |  Cats: much simpler — no CDC form required
// ════════════════════════════════════════════════════════════════════════════
export function getUSScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  isUSVaccinated: boolean,
  petType: PetType = 'dog',
): TravelScenario {

  // ── CAT path ──────────────────────────────────────────────────────────────
  if (petType === 'cat') {
    return {
      id: 'us_cat',
      label: 'Cat to United States',
      color: '#22c55e',
      emoji: '🐱',
      summary: 'Cats entering the US have minimal requirements. No CDC import form, no rabies vaccine mandate — cats just need to appear healthy at the border.',
      checklist: [
        {
          id: 'us_cat_healthy',
          title: 'Cat must appear healthy on arrival',
          description: 'CBP/CDC officers may deny entry to cats showing signs of illness, open wounds, or disease. Ensure your cat is visibly healthy before travel.',
          daysBeforeTravel: null,
          mandatory: true,
          category: 'health',
          officialSource: 'https://www.cdc.gov/importation/cats/index.html',
          completed: false,
        },
        {
          id: 'us_cat_rabies_rec',
          title: 'Rabies vaccination (strongly recommended)',
          description: 'Not legally required by the US, but many airlines, states, and boarding facilities require it. Hawaii and Guam have strict quarantine rules.',
          daysBeforeTravel: null,
          mandatory: false,
          category: 'vaccination',
          officialSource: 'https://www.cdc.gov/importation/cats/index.html',
          completed: false,
        },
        {
          id: 'us_cat_health_cert_rec',
          title: 'Veterinary health certificate (recommended)',
          description: 'Not federally required, but airlines typically require a health certificate issued within 10 days of travel for in-cabin or checked pets.',
          daysBeforeTravel: 10,
          daysWindow: 10,
          mandatory: false,
          category: 'document',
          officialSource: 'https://www.cdc.gov/importation/cats/index.html',
          completed: false,
        },
        {
          id: 'us_cat_microchip_rec',
          title: 'Microchip (ISO 11784/11785) recommended',
          description: 'Not required for US entry but essential for identification if your cat gets lost, and required by many airlines and pet-friendly accommodation.',
          daysBeforeTravel: null,
          mandatory: false,
          category: 'microchip',
          officialSource: 'https://www.cdc.gov/importation/cats/index.html',
          completed: false,
        },
        {
          id: 'us_cat_hawaii',
          title: 'Hawaii / Guam: 120-day quarantine (if applicable)',
          description: 'Hawaii and Guam are rabies-free. Entry requires proof of microchip, two rabies vaccinations, a passing OIE-FAVN titer test, and advance permit. 5-day-or-less quarantine available if all conditions are met.',
          daysBeforeTravel: 120,
          mandatory: false,
          category: 'booking',
          officialSource: 'https://hdoa.hawaii.gov/ai/aqs/aqs-info/',
          completed: false,
        },
      ],
    };
  }

  // ── DOG paths (unchanged) ─────────────────────────────────────────────────
  const universalItems: ChecklistItem[] = [
    {
      id: 'us_age',
      title: 'Dog must be at least 6 months old',
      description: 'CDC requires every dog entering the US to be ≥6 months old.',
      daysBeforeTravel: null,
      mandatory: true,
      category: 'health',
      officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
      completed: false,
    },
    {
      id: 'us_microchip',
      title: 'ISO-compatible microchip implanted',
      description: 'Microchip must comply with ISO 11784/11785 and must be implanted BEFORE any rabies vaccination.',
      daysBeforeTravel: null,
      mandatory: true,
      category: 'microchip',
      officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
      completed: false,
    },
    {
      id: 'us_healthy',
      title: 'Dog must appear healthy on arrival',
      description: 'Dogs showing signs of illness may be denied entry or held for inspection.',
      daysBeforeTravel: null,
      mandatory: true,
      category: 'health',
      officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
      completed: false,
    },
    {
      id: 'us_cdc_form',
      title: 'Complete CDC Dog Import Form online',
      description: 'Free online form at cdc.gov. Receipt is valid for 6 months / multiple re-entries from same country. Can be shown on phone.',
      daysBeforeTravel: 7,
      mandatory: true,
      category: 'form',
      officialSource: 'https://www.cdc.gov/importation/dogs/dog-import-form-instructions.html',
      completed: false,
    },
  ];

  if (originRisk === 'rabies_free' || originRisk === 'low_risk') {
    return {
      id: 'us_scenario_1',
      label: 'Low-Risk Country',
      color: '#22c55e',
      emoji: '🟢',
      summary: 'Simplest path — only the CDC Dog Import Form is required. Rabies vaccine strongly recommended but not mandatory.',
      checklist: [
        ...universalItems,
        {
          id: 'us_rabies_rec',
          title: 'Rabies vaccination (recommended)',
          description: 'Not legally required from low/no-risk countries, but strongly recommended by CDC.',
          daysBeforeTravel: null,
          mandatory: false,
          category: 'vaccination',
          officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
          completed: false,
        },
      ],
    };
  }

  if (isUSVaccinated) {
    // Scenario 3: US-vaccinated dog returning from high-risk country
    return {
      id: 'us_scenario_3',
      label: 'US-Vaccinated Returning',
      color: '#3b82f6',
      emoji: '🔵',
      summary: 'US-vaccinated dog returning from a high-risk country. Needs CDC form + USDA-endorsed US Rabies Vaccination Certificate. No titer test required.',
      checklist: [
        ...universalItems,
        {
          id: 'us_rabies_vacc_us',
          title: 'Valid US-issued rabies vaccination',
          description: 'Must have been vaccinated in the US by a licensed veterinarian.',
          daysBeforeTravel: null,
          mandatory: true,
          category: 'vaccination',
          officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
          completed: false,
        },
        {
          id: 'us_cert_us_vacc',
          title: 'Certification of US-Issued Rabies Vaccination form',
          description: 'Completed by a USDA-accredited vet and USDA-endorsed BEFORE leaving the US. As of Jul 31, 2025 cannot be issued retroactively.',
          daysBeforeTravel: 30,
          mandatory: true,
          category: 'document',
          officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
          completed: false,
        },
      ],
    };
  }

  // Scenario 2: Foreign-vaccinated dog from high-risk country
  return {
    id: 'us_scenario_2',
    label: 'High-Risk Country (Foreign Vaccinated)',
    color: '#ef4444',
    emoji: '🔴',
    summary: 'Most demanding path. Requires foreign vaccination cert, CDC-approved titer test ≥0.5 IU/mL, and booking at a CDC-registered animal care facility.',
    checklist: [
      ...universalItems,
      {
        id: 'us_rabies_vacc_foreign',
        title: 'Rabies vaccination (foreign)',
        description: 'Dog must be vaccinated against rabies by a licensed vet in the origin country.',
        daysBeforeTravel: 60,
        mandatory: true,
        category: 'vaccination',
        officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
        completed: false,
      },
      {
        id: 'us_cert_foreign_vacc',
        title: 'Certification of Foreign Rabies Vaccination & Microchip form',
        description: 'Completed by your vet AND endorsed by an official government veterinarian in origin country.',
        daysBeforeTravel: 45,
        mandatory: true,
        category: 'document',
        officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
        completed: false,
      },
      {
        id: 'us_titer_blood_draw',
        title: 'Blood draw for rabies titer test',
        description: "Must be drawn at least 30 days AFTER the dog's first rabies vaccination. Use a CDC-approved laboratory.",
        daysBeforeTravel: 90,
        daysWindow: 30,
        mandatory: true,
        category: 'health',
        officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
        completed: false,
      },
      {
        id: 'us_titer_results',
        title: 'Titer test results ≥ 0.5 IU/mL received',
        description: 'Passing result must be received at least 28 days before US entry. If failed, re-vaccinate and redraw.',
        daysBeforeTravel: 28,
        mandatory: true,
        category: 'document',
        officialSource: 'https://www.cdc.gov/importation/dogs/index.html',
        completed: false,
      },
      {
        id: 'us_cdc_facility_booking',
        title: 'Book CDC-registered animal care facility',
        description: 'Required reservation. If no valid titer: 28-day quarantine at your expense. Entry ONLY at airports with CDC-registered facility.',
        daysBeforeTravel: 60,
        mandatory: true,
        category: 'booking',
        officialSource: 'https://www.cdc.gov/importation/dogs/approved-care-facilities.html',
        completed: false,
      },
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// CANADA – dog import rules (CFIA)
// ════════════════════════════════════════════════════════════════════════════
export function getCAScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  petType: PetType,
): TravelScenario {
  if (petType === 'cat') {
    return {
      id: 'ca_cat',
      label: 'Cat to Canada',
      color: '#22c55e',
      emoji: '🐱',
      summary: 'Cats entering Canada have minimal requirements — no rabies vaccination or health certificate is federally required, but they must appear healthy. Airlines typically have additional requirements.',
      checklist: [
        {
          id: 'ca_cat_healthy',
          title: 'Cat must appear healthy',
          description: 'CFIA officers may deny entry to cats showing signs of disease, injury, or infestation.',
          daysBeforeTravel: null,
          mandatory: true,
          category: 'health',
          officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
          completed: false,
        },
        {
          id: 'ca_cat_rabies_rec',
          title: 'Rabies vaccination (recommended)',
          description: 'Not federally required for cats entering Canada, but strongly recommended. Some provinces and most boarding facilities require it.',
          daysBeforeTravel: null,
          mandatory: false,
          category: 'vaccination',
          officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
          completed: false,
        },
        {
          id: 'ca_cat_health_cert',
          title: 'Veterinary health certificate (airline requirement)',
          description: 'Not required by CFIA but most airlines require a vet health certificate issued within 10 days of travel for cats flying in-cabin or as checked baggage.',
          daysBeforeTravel: 10,
          daysWindow: 10,
          mandatory: false,
          category: 'document',
          officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
          completed: false,
        },
        {
          id: 'ca_cat_ownership',
          title: 'Proof of ownership / photo identification',
          description: 'Recommended to carry a photo of you with your pet and any registration documents.',
          daysBeforeTravel: null,
          mandatory: false,
          category: 'document',
          officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
          completed: false,
        },
        {
          id: 'ca_cat_microchip_rec',
          title: 'Microchip (ISO 11784/11785) recommended',
          description: 'Not legally required for Canada entry but strongly recommended for identification and recovery if lost.',
          daysBeforeTravel: null,
          mandatory: false,
          category: 'microchip',
          officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
          completed: false,
        },
      ],
    };
  }

  if (originRisk === 'rabies_free' || originRisk === 'low_risk') {
    return {
      id: 'ca_dog_low',
      label: 'Dog to Canada – Low Risk',
      color: '#22c55e',
      emoji: '🟢',
      summary: 'Dogs from rabies-free or low-risk countries need a valid rabies vaccination certificate signed by a licensed vet.',
      checklist: [
        {
          id: 'ca_dog_healthy',
          title: 'Dog must appear healthy',
          description: 'CFIA officers can deny entry to dogs showing signs of disease or injury.',
          daysBeforeTravel: null,
          mandatory: true,
          category: 'health',
          officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
          completed: false,
        },
        {
          id: 'ca_rabies_cert',
          title: 'Rabies vaccination certificate',
          description: 'Valid certificate signed by a licensed veterinarian. Must not have expired.',
          daysBeforeTravel: null,
          mandatory: true,
          category: 'vaccination',
          officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
          completed: false,
        },
      ],
    };
  }

  return {
    id: 'ca_dog_high',
    label: 'Dog to Canada – High Risk',
    color: '#f97316',
    emoji: '🟠',
    summary: 'Dogs from high-risk countries require a valid rabies vaccination certificate AND a veterinary health certificate.',
    checklist: [
      {
        id: 'ca_dog_healthy_hr',
        title: 'Dog must appear healthy',
        description: 'CFIA officers can deny entry to dogs showing signs of disease.',
        daysBeforeTravel: null,
        mandatory: true,
        category: 'health',
        officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
        completed: false,
      },
      {
        id: 'ca_rabies_cert_hr',
        title: 'Rabies vaccination certificate',
        description: 'Valid certificate signed by a licensed veterinarian.',
        daysBeforeTravel: null,
        mandatory: true,
        category: 'vaccination',
        officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
        completed: false,
      },
      {
        id: 'ca_health_cert',
        title: 'Veterinary health certificate',
        description: 'Official health certificate issued by an accredited veterinarian within 10 days of travel.',
        daysBeforeTravel: 10,
        daysWindow: 10,
        mandatory: true,
        category: 'document',
        officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
        completed: false,
      },
      {
        id: 'ca_microchip',
        title: 'Microchip (ISO 11784/11785) recommended',
        description: 'Not legally required but strongly recommended for identification.',
        daysBeforeTravel: null,
        mandatory: false,
        category: 'microchip',
        officialSource: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
        completed: false,
      },
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// EUROPEAN UNION – pet travel rules (European Commission)
// Same microchip + rabies rules for dogs AND cats.
// Key difference: tapeworm treatment is dogs-ONLY.
// ════════════════════════════════════════════════════════════════════════════
export function getEUScenario(
  originRisk: 'rabies_free' | 'low_risk' | 'high_risk',
  petType: PetType,
): TravelScenario {
  const euBase: ChecklistItem[] = [
    {
      id: 'eu_microchip',
      title: 'ISO microchip (15-digit)',
      description: `Mandatory for all pets (dogs, cats, ferrets) entering the EU. Must be implanted before rabies vaccination.`,
      daysBeforeTravel: null,
      mandatory: true,
      category: 'microchip',
      officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en',
      completed: false,
    },
    {
      id: 'eu_rabies_vacc',
      title: 'Rabies vaccination up-to-date',
      description: 'Must be administered after microchip implantation. First vaccine requires 21-day wait before entry.',
      daysBeforeTravel: 21,
      mandatory: true,
      category: 'vaccination',
      officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en',
      completed: false,
    },
    {
      id: 'eu_health_cert',
      title: 'EU health certificate or EU pet passport',
      description: 'Official health certificate (for non-EU pets) or EU pet passport (for EU-resident pets). Issued by an official vet within 10 days of travel.',
      daysBeforeTravel: 10,
      daysWindow: 10,
      mandatory: true,
      category: 'document',
      officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en',
      completed: false,
    },
  ];

  if (originRisk === 'high_risk') {
    return {
      id: `eu_high_risk_${petType}`,
      label: `EU Entry – High Risk Country (${petType === 'cat' ? 'Cat' : 'Dog'})`,
      color: '#ef4444',
      emoji: petType === 'cat' ? '🐱' : '🔴',
      summary: petType === 'cat'
        ? 'Cats from high-risk countries require microchip, up-to-date rabies vaccination, titer test ≥0.5 IU/mL, and an EU health certificate. No tapeworm treatment required for cats.'
        : 'High-risk origin requires microchip, up-to-date rabies vaccination, titer test, and an official health certificate. The 21-day post-vaccination wait applies.',
      checklist: [
        ...euBase,
        {
          id: 'eu_titer',
          title: 'Rabies antibody titer test ≥ 0.5 IU/mL',
          description: 'Blood sample drawn by official vet at least 30 days after vaccination. Test done in EU-approved lab. Results needed 3 months before entry (some member states vary).',
          daysBeforeTravel: 90,
          mandatory: true,
          category: 'health',
          officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en',
          completed: false,
        },
        // Tapeworm treatment — dogs only
        ...(petType === 'dog' ? [{
          id: 'eu_tapeworm',
          title: 'Tapeworm treatment (dogs only)',
          description: 'Some EU member states (e.g. Finland, Ireland, Malta, Norway) require tapeworm (Echinococcus) treatment 1–5 days before entry. Cats are exempt.',
          daysBeforeTravel: 3,
          daysWindow: 4,
          mandatory: true,
          category: 'health' as const,
          officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en',
          completed: false,
        }] : []),
      ],
    };
  }

  return {
    id: `eu_low_risk_${petType}`,
    label: `EU Entry – Low / No Risk Country (${petType === 'cat' ? 'Cat' : 'Dog'})`,
    color: '#22c55e',
    emoji: petType === 'cat' ? '🐱' : '🟢',
    summary: petType === 'cat'
      ? 'Cats from listed countries need microchip, valid rabies vaccination, and an EU health certificate or pet passport. No titer test or tapeworm treatment required.'
      : 'Pets from listed third countries (e.g. UK, Australia) need microchip, valid rabies vaccination, and a health certificate. No titer test required.',
    checklist: [
      ...euBase,
      // Tapeworm optional reminder — dogs only
      ...(petType === 'dog' ? [{
        id: 'eu_tapeworm_optional',
        title: 'Tapeworm treatment (if entering specific countries) — dogs only',
        description: 'Required when entering Finland, Ireland, Malta, Norway, or the UK — administered 1–5 days before entry. Not required for cats.',
        daysBeforeTravel: 3,
        daysWindow: 4,
        mandatory: false,
        category: 'health' as const,
        officialSource: 'https://food.ec.europa.eu/animals/movement-pets_en',
        completed: false,
      }] : []),
    ],
  };
}

// ── Master factory ────────────────────────────────────────────────────────────
export function buildTravelScenario(params: {
  destination: DestinationCountry;
  originCountryCode: string;
  petType: PetType;
  isUSVaccinated?: boolean;
}): TravelScenario {
  const origin = COUNTRIES.find(c => c.code === params.originCountryCode);
  const risk = origin?.region ?? 'high_risk';

  switch (params.destination) {
    case 'US':
      return getUSScenario(risk, params.isUSVaccinated ?? false, params.petType);
    case 'CA':
      return getCAScenario(risk, params.petType);
    case 'EU':
      return getEUScenario(risk, params.petType);
  }
}
