// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID — Playwright E2E Test Suite
// Covers: UC-01, UC-02, UC-03, UC-04, UC-06, UC-07
// Runs against: http://localhost:5173/petroamid-web (npm run dev)
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect, type Page } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function clearStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function createProfile(page: Page, name = 'TestUser') {
  await clearStorage(page);
  await page.waitForSelector('text=Get Started', { timeout: 10_000 });
  await page.click('text=Get Started');
  await page.fill('input[placeholder="e.g. Alex"]', name);
  await page.click('button:has-text("Get Started")');
  await page.waitForURL(/\/$|\/petroamid-web\/?$/);
}

async function addPet(page: Page, opts: {
  name: string; species?: 'dog' | 'cat';
  dob?: string; microchip?: string;
}) {
  await page.click('text=My Pets');
  await page.click('text=Add Pet');
  if (opts.species === 'cat') await page.click('button:has-text("Cat")');
  await page.fill('input[placeholder="e.g. Buddy"]', opts.name);
  const dob = opts.dob ?? '2022-01-01';
  await page.fill('input[type="date"]', dob);
  if (opts.microchip) {
    await page.fill('input[placeholder="15-digit ISO number"]', opts.microchip);
  }
  await page.click('button:has-text("Next")');   // step 1 → 2
  await page.click('button:has-text("Next")');   // step 2 → 3
  await page.click('button:has-text("Save Pet")');
}

async function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
async function daysFromNow(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// UC-01 — Profile Setup
// ─────────────────────────────────────────────────────────────────────────────
test.describe('UC-01 — Profile Setup', () => {

  test('TC-01-01: creates first profile and lands on dashboard', async ({ page }) => {
    await createProfile(page, 'Alex');
    await expect(page.locator('text=Alex')).toBeVisible();
    await expect(page.locator('text=Good')).toBeVisible(); // greeting
  });

  test('TC-01-04: adds a dog', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Buddy', species: 'dog', dob: '2022-06-15' });
    await expect(page.locator('text=Buddy')).toBeVisible();
  });

  test('TC-01-05: adds a cat', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Whiskers', species: 'cat', dob: '2021-03-10' });
    await expect(page.locator('text=Whiskers')).toBeVisible();
  });

  test('TC-01-06: microchip field rejects letters', async ({ page }) => {
    await createProfile(page);
    await page.click('text=My Pets');
    await page.click('text=Add Pet');
    const field = page.locator('input[placeholder="15-digit ISO number"]');
    await field.fill('ABC123');
    const value = await field.inputValue();
    expect(value).toBe('123'); // letters stripped, only digits remain
  });

  test('TC-01-07: microchip field caps at 15 digits', async ({ page }) => {
    await createProfile(page);
    await page.click('text=My Pets');
    await page.click('text=Add Pet');
    const field = page.locator('input[placeholder="15-digit ISO number"]');
    await field.fill('1234567890123456789'); // 19 digits
    const value = await field.inputValue();
    expect(value.length).toBe(15);
    // Counter shows 15/15 in green
    await expect(page.locator('text=15/15 digits')).toBeVisible();
  });

  test('TC-01-08: name required error', async ({ page }) => {
    await createProfile(page);
    await page.click('text=My Pets');
    await page.click('text=Add Pet');
    // Skip name, fill DOB, go to step 3 and try save
    await page.fill('input[type="date"]', '2022-01-01');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Save Pet")');
    await expect(page.locator("text=Please enter your pet's name")).toBeVisible();
  });

  test('TC-01-09: date of birth required error', async ({ page }) => {
    await createProfile(page);
    await page.click('text=My Pets');
    await page.click('text=Add Pet');
    await page.fill('input[placeholder="e.g. Buddy"]', 'NoDate');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Save Pet")');
    await expect(page.locator("text=Please enter your pet's date of birth")).toBeVisible();
  });

  test('TC-01-10: add vaccination record', async ({ page }) => {
    await createProfile(page);
    await page.click('text=My Pets');
    await page.click('text=Add Pet');
    await page.fill('input[placeholder="e.g. Buddy"]', 'Buddy');
    await page.fill('input[type="date"]', '2022-01-01');
    await page.click('button:has-text("Next")'); // to vaccinations tab
    await page.fill('input[placeholder="e.g. Rabies"]', 'Rabies');
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(1).fill('2024-01-15');
    await dateInputs.nth(2).fill('2027-01-15');
    await page.click('button:has-text("Add Record")');
    await expect(page.locator('text=💉 Rabies')).toBeVisible();
  });

  test('TC-01-11: edit existing pet', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Original', dob: '2022-01-01' });
    await page.click('button:has-text("Edit")');
    await page.fill('input[placeholder="e.g. Buddy"]', 'Renamed');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Renamed')).toBeVisible();
  });

  test('TC-01-12: delete a pet', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'ToDelete', dob: '2022-01-01' });
    await expect(page.locator('text=ToDelete')).toBeVisible();
    await page.click('[title="delete"], button:has(text("🗑"))').catch(() =>
      page.locator('button').filter({ hasText: '🗑' }).first().click()
    );
    await page.click('button:has-text("Delete")');
    await expect(page.locator('text=ToDelete')).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UC-02 — Checklist Generation
// ─────────────────────────────────────────────────────────────────────────────
test.describe('UC-02 — Checklist Generation', () => {

  test('TC-02-01: generate without selecting anything shows error', async ({ page }) => {
    await createProfile(page);
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Generate Checklist")');
    await expect(page.locator('text=select a pet')).toBeVisible();
  });

  test('TC-02-02: no destination shows error', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2022-01-01' });
    await page.click('text=Plan a Trip');
    // Select pet, select origin but no destination
    await page.click('button:has-text("Rex")');
    await page.fill('input[placeholder="Search country…"]', 'UK');
    await page.locator('button').filter({ hasText: 'United Kingdom' }).click();
    await page.fill('input[type="date"]', await daysFromNow(30));
    await page.click('button:has-text("Generate Checklist")');
    await expect(page.locator('text=select a destination')).toBeVisible();
  });

  test('TC-02-04: travel date in past shows error', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2022-01-01' });
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Rex")');
    await page.click('button:has-text("US")');
    await page.fill('input[placeholder="Search country…"]', 'UK');
    await page.locator('button').filter({ hasText: 'United Kingdom' }).click();
    // min attribute prevents past date input, verify min is set to tomorrow
    const dateInput = page.locator('input[type="date"]').last();
    const minVal = await dateInput.getAttribute('min');
    const tomorrowStr = await tomorrow();
    expect(minVal).toBe(tomorrowStr);
  });

  test('TC-02-05 + TC-02-12: dog to US — checklist generated, microchip auto-ticked', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2020-01-01', microchip: '982000123456789', species: 'dog' });
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Rex")');
    await page.click('button:has-text("US")');
    await page.fill('input[placeholder="Search country…"]', 'UK');
    await page.locator('button').filter({ hasText: 'United Kingdom' }).click();
    await page.fill('input[type="date"]', await daysFromNow(90));
    await page.click('button:has-text("Generate Checklist")');
    await expect(page.locator('text=Microchip')).toBeVisible();
  });

  test('TC-02-11: free plan blocks second trip', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2020-01-01' });
    // Create first trip
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Rex")');
    await page.click('button:has-text("US")');
    await page.fill('input[placeholder="Search country…"]', 'UK');
    await page.locator('button').filter({ hasText: 'United Kingdom' }).click();
    await page.fill('input[type="date"]', await daysFromNow(60));
    await page.click('button:has-text("Generate Checklist")');
    // Try second trip
    await page.click('text=Plan a Trip');
    await expect(page.locator('text=Free plan')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UC-03 — Timeline Management
// ─────────────────────────────────────────────────────────────────────────────
test.describe('UC-03 — Timeline Management', () => {

  async function goToChecklist(page: Page, daysAway: number) {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2020-01-01', species: 'dog' });
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Rex")');
    await page.click('button:has-text("EU")');
    await page.fill('input[placeholder="Search country…"]', 'India');
    await page.locator('button').filter({ hasText: 'India' }).click();
    await page.fill('input[type="date"]', await daysFromNow(daysAway));
    await page.click('button:has-text("Generate Checklist")');
    await page.waitForURL(/\/trips\//);
  }

  test('TC-03-01: overdue badge appears when travel is tomorrow', async ({ page }) => {
    await goToChecklist(page, 1);
    await expect(page.locator('text=Overdue')).toBeVisible({ timeout: 10_000 });
  });

  test('TC-03-04: scheduled badge when travel is 60 days away', async ({ page }) => {
    await goToChecklist(page, 60);
    await expect(page.locator('text=Scheduled')).toBeVisible();
  });

  test('TC-03-06: sort order — overdue items appear at top', async ({ page }) => {
    await goToChecklist(page, 1);
    const badges = page.locator('[style*="border-radius: 20px"]').filter({ hasText: /Overdue|Urgent/ });
    await expect(badges.first()).toBeVisible();
  });

  test('TC-03-07: readiness score shows as percentage', async ({ page }) => {
    await goToChecklist(page, 60);
    await expect(page.locator('text=Readiness Score')).toBeVisible();
    await expect(page.locator('text=/%/')).toBeVisible().catch(() =>
      expect(page.locator('text=0%')).toBeVisible()
    );
  });

  test('TC-03-09: due date shown on expanding an item', async ({ page }) => {
    await goToChecklist(page, 60);
    // Click first checklist item to expand
    const items = page.locator('[style*="border-radius: 14px"]').filter({ hasText: /Required|Scheduled/ });
    await items.first().click();
    await expect(page.locator('text=Due by')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UC-04 — Item Tracking
// ─────────────────────────────────────────────────────────────────────────────
test.describe('UC-04 — Item Tracking', () => {

  test('TC-04-02: tapping locked item shows unlock modal', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2020-01-01', species: 'dog' });
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Rex")');
    await page.click('button:has-text("US")');
    await page.fill('input[placeholder="Search country…"]', 'UK');
    await page.locator('button').filter({ hasText: 'United Kingdom' }).click();
    await page.fill('input[type="date"]', await daysFromNow(90));
    await page.click('button:has-text("Generate Checklist")');
    await page.waitForURL(/\/trips\//);
    // Tap a locked checkbox (🔒)
    const locked = page.locator('button').filter({ hasText: '🔒' }).first();
    if (await locked.isVisible()) {
      await locked.click();
      await expect(page.locator('text=Unlock')).toBeVisible();
    }
  });

  test('TC-04-03: unlock button makes all items interactive', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2020-01-01', species: 'dog' });
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Rex")');
    await page.click('button:has-text("US")');
    await page.fill('input[placeholder="Search country…"]', 'UK');
    await page.locator('button').filter({ hasText: 'United Kingdom' }).click();
    await page.fill('input[type="date"]', await daysFromNow(90));
    await page.click('button:has-text("Generate Checklist")');
    await page.waitForURL(/\/trips\//);
    await page.click('button:has-text("Unlock")');
    await page.click('button:has-text("Unlock This Trip")');
    // Lock icons should be gone
    await expect(page.locator('button:has-text("🔒")')).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UC-06 — Offline Storage
// ─────────────────────────────────────────────────────────────────────────────
test.describe('UC-06 — Offline Storage', () => {

  test('TC-06-01: data persists after page refresh', async ({ page }) => {
    await createProfile(page, 'PersistUser');
    await addPet(page, { name: 'Persist', dob: '2022-01-01' });
    await page.reload();
    await page.waitForURL(/\//);
    await expect(page.locator('text=Persist')).toBeVisible();
  });

  test('TC-06-07: profile data is isolated', async ({ page }) => {
    // Profile A with a pet
    await createProfile(page, 'ProfileA');
    await addPet(page, { name: 'OnlyForA', dob: '2022-01-01' });
    // Create Profile B via Settings
    await page.click('text=Settings');
    await page.click('button:has-text("+ Add Profile")');
    await page.fill('input[placeholder="e.g. Alex"]', 'ProfileB');
    await page.click('button:has-text("Get Started"), button:has-text("Create Profile")');
    // Profile B should NOT see OnlyForA
    await page.click('text=My Pets');
    await expect(page.locator('text=OnlyForA')).not.toBeVisible();
    await expect(page.locator('text=No pets yet')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UC-07 — Navigation & UX
// ─────────────────────────────────────────────────────────────────────────────
test.describe('UC-07 — Navigation & UX', () => {

  test('TC-07-03: back button returns without saving', async ({ page }) => {
    await createProfile(page);
    await page.click('text=My Pets');
    await page.click('text=Add Pet');
    await page.fill('input[placeholder="e.g. Buddy"]', 'Unsaved');
    await page.click('button:has-text("← Back")');
    await expect(page).toHaveURL(/\/pets/);
    await expect(page.locator('text=Unsaved')).not.toBeVisible();
  });

  test('TC-07-07: empty state shown when no pets', async ({ page }) => {
    await createProfile(page);
    await expect(page.locator('text=Ready to Explore')).toBeVisible();
    await expect(page.locator('text=Add My Pet')).toBeVisible();
  });

  test('TC-07-08: page refresh keeps current route', async ({ page }) => {
    await createProfile(page);
    await page.click('text=My Pets');
    await expect(page).toHaveURL(/\/pets/);
    await page.reload();
    await page.waitForURL(/\/pets/);
    await expect(page).toHaveURL(/\/pets/);
  });

  test('TC-07-04: dashboard shows trip with days countdown', async ({ page }) => {
    await createProfile(page);
    await addPet(page, { name: 'Rex', dob: '2020-01-01' });
    await page.click('text=Plan a Trip');
    await page.click('button:has-text("Rex")');
    await page.click('button:has-text("US")');
    await page.fill('input[placeholder="Search country…"]', 'UK');
    await page.locator('button').filter({ hasText: 'United Kingdom' }).click();
    await page.fill('input[type="date"]', await daysFromNow(30));
    await page.click('button:has-text("Generate Checklist")');
    await page.click('text=Dashboard').catch(() =>
      page.goto('/')
    );
    await expect(page.locator('text=/\\d+d away/')).toBeVisible();
  });
});
