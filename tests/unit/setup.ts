import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── Proper localStorage mock ───────────────────────────────────────────────────
const storage: Record<string, string> = {};
const localStorageMock = {
  getItem:    (k: string)         => storage[k] ?? null,
  setItem:    (k: string, v: string) => { storage[k] = String(v); },
  removeItem: (k: string)         => { delete storage[k]; },
  clear:      ()                  => { Object.keys(storage).forEach(k => delete storage[k]); },
  get length() { return Object.keys(storage).length; },
  key: (i: number) => Object.keys(storage)[i] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// ── Stub React hooks that Zustand uses internally ─────────────────────────────
// Zustand's persist middleware calls useCallback/useEffect via React.
// In a pure Node/jsdom unit test we bypass that by calling the store factory
// directly — the mock below prevents "Cannot read properties of null" errors.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useCallback: (fn: any) => fn,
    useEffect:   (fn: any) => fn(),
    useRef:      (v: any)  => ({ current: v }),
    useMemo:     (fn: any) => fn(),
    useState:    (v: any)  => [v, () => {}],
  };
});
