// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Sync Service  (local file-based, no backend)
//
// Cross-device sync works via .petroamid JSON file:
//   Export on Device A → transfer file → Import on Device B
//
// Works identically between:
//   • Web ↔ Web
//   • Web ↔ Android (once RN app has export/import)
//   • Web ↔ iOS
// ─────────────────────────────────────────────────────────────────────────────
import type { Pet, Trip, PurchaseRecord } from '../store/appStore';
import type { Profile } from '../store/profileStore';

export interface PetRoamBundle {
  version:    number;
  exportedAt: string;
  profile:    Profile;
  pets:       Pet[];
  trips:      Trip[];
  purchases:  PurchaseRecord[];
}

export function downloadBundle(bundle: PetRoamBundle): void {
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `PetRoamID_${bundle.profile.displayName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.petroamid`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBundle(): Promise<PetRoamBundle> {
  return new Promise((resolve, reject) => {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = '.petroamid,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { reject(new Error('No file selected')); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const bundle = JSON.parse(ev.target?.result as string) as PetRoamBundle;
          if (!bundle.pets || !bundle.trips) throw new Error('Invalid PetRoamID backup file');
          resolve(bundle);
        } catch (err) { reject(err); }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
