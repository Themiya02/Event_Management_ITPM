import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.use({
  viewport: { width: 1280, height: 720 },
  locale: 'en-GB',
  screenshot: 'on',
  video: 'on',
  trace: 'on',
});

/**
 * 15 INTEGRATED TEST CASES FOR EVENT HANDLING
 * This suite follows the full lifecycle: Organizer -> Admin -> User -> Organizer
 * Run with: cd frontend && npx playwright test tests/event-handling.spec.js --project=chromium
 */
test.describe.serial('Complete Event Lifecycle & Feature Suite (15 Steps)', () => {
  test.setTimeout(600000); // 10 minutes total
  let eventName;
  const timestamp = Date.now();

  test.beforeAll(() => {
    eventName = `MASTER-E2E-${timestamp}`;
  });

  async function login(page, email, password, role) {
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.selectOption('select#role', role);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); 
  }

  // --- ORGANIZER WORKFLOW ---
  
  test('1. Organizer Login Successfully', async ({ page }) => {
    await login(page, 'chaminda@gmail.com', '123456', 'organizer');
    await expect(page).toHaveURL(/organizer|dashboard/);
  });

  test('2. Organizer Dashboard Metrics Visible', async ({ page }) => {
    await login(page, 'chaminda@gmail.com', '123456', 'organizer');
    await expect(page.locator('body')).toContainText(/Dashboard|Overview/i);
    await expect(page.locator('.glass-panel').first()).toBeVisible();
  });

  test('3. Organizer Creates Event (Step 1-3)', async ({ page }) => {
    await login(page, 'chaminda@gmail.com', '123456', 'organizer');
    await page.goto(`${BASE_URL}/organizer/create-event`);
    
    // Step 1: Basic Info
    await page.fill('input[name="organizerName"]', 'Master Organizer');
    await page.fill('input[name="organizingBody"]', 'E2E Testing Corp');
    await page.click('button:has-text("Continue")');
    
    // Step 2: Event Details
    await page.fill('input[name="eventTitle"]', eventName);
    await page.fill('textarea[name="eventDescription"]', 'A comprehensive 15-step automated test event.');
    await page.fill('input[name="eventDate"]', '2026-11-20');
    await page.fill('input[name="eventTime"]', '10:00');
    await page.click('button:has-text("Continue")');
    
    // Step 3: Venue
    await page.fill('input[name="venueName"]', 'Main Campus Hall');
    await page.locator('.radio-card').filter({ hasText: 'Indoor' }).click();
    await page.fill('input[name="seatLimit"]', '100');
    await page.locator('.radio-card').filter({ hasText: 'Free Ticket' }).click();
    
    page.on('dialog', d => d.accept());
    await page.click('button:has-text("Launch Event")');
    await page.waitForURL(/organizer\/track/, { timeout: 60000 });
    await expect(page).toHaveURL(/track/);
  });

  test('4. Tracker Shows Event as Pending', async ({ page }) => {
    await login(page, 'chaminda@gmail.com', '123456', 'organizer');
    await page.goto(`${BASE_URL}/organizer/track`);
    const select = page.locator('select.select-event');
    await page.waitForFunction((name) => document.querySelector('select.select-event')?.innerText.includes(name), eventName);
    await select.selectOption({ label: eventName });
    await expect(page.locator('.status-pill')).toContainText('Pending');
  });

  // --- ADMIN WORKFLOW ---

  test('5. Admin Login & Pending View', async ({ page }) => {
    await login(page, 'admin@gmail.com', '123456', 'admin');
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    await expect(page.locator('body')).toContainText(eventName, { timeout: 15000 });
  });

  test('6. Admin Multi-Stage Stage 1 & 2 Clearing', async ({ page }) => {
    await login(page, 'admin@gmail.com', '123456', 'admin');
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    const card = page.locator('.event-card').filter({ hasText: eventName }).first();
    await card.locator('button:has-text("Review")').click();
    
    const labels = page.locator('label.approval-stage-card');
    await labels.nth(0).click({ force: true });
    await page.waitForTimeout(1000);
    await labels.nth(1).click({ force: true });
    await page.waitForTimeout(1000);
    await expect(labels.nth(0)).toHaveClass(/checked/);
  });

  test('7. Admin Multi-Stage Stage 3 & 4 Clearing', async ({ page }) => {
    await login(page, 'admin@gmail.com', '123456', 'admin');
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    await page.locator('.event-card').filter({ hasText: eventName }).locator('button:has-text("Review")').click();
    
    const labels = page.locator('label.approval-stage-card');
    await labels.nth(2).click({ force: true });
    await page.waitForTimeout(1000);
    await labels.nth(3).click({ force: true });
    await page.waitForTimeout(1000);
    await expect(page.locator('.ready-text')).toBeVisible();
  });

  test('8. Admin Permanently Publishes Event', async ({ page }) => {
    await login(page, 'admin@gmail.com', '123456', 'admin');
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    await page.locator('.event-card').filter({ hasText: eventName }).locator('button:has-text("Review")').click();
    
    page.on('dialog', d => d.accept());
    await page.click('button:has-text("Permanently Publish Event")');
    await page.waitForURL(/admin\/events\/upcoming/);
  });

  // --- USER WORKFLOW ---

  test('9. User Login & Event Visibility', async ({ page }) => {
    await login(page, 'user@gmail.com', '123456', 'user');
    await page.goto(`${BASE_URL}/home`);
    await expect(page.locator('body')).toContainText(eventName, { timeout: 15000 });
  });

  test('10. User Views Detailed Event Info', async ({ page }) => {
    await login(page, 'user@gmail.com', '123456', 'user');
    await page.goto(`${BASE_URL}/home`);
    await page.locator('.event-card').filter({ hasText: eventName }).locator('button:has-text("Register")').click();
    await expect(page.locator('h1')).toContainText(eventName);
    await expect(page.locator('.details-grid')).toBeVisible();
  });

  test('11. User Registers for Event', async ({ page }) => {
    await login(page, 'user@gmail.com', '123456', 'user');
    await page.goto(`${BASE_URL}/home`);
    await page.locator('.event-card').filter({ hasText: eventName }).locator('button:has-text("Register")').click();
    
    await page.fill('input[name="participantName"]', 'E2E Tester');
    await page.fill('input[name="campusId"]', 'IT21990011');
    await page.selectOption('select', '3rd Year');
    
    page.on('dialog', d => d.accept());
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/successfully/i, { timeout: 20000 });
  });

  // --- FINALIZATION ---

  test('12. Organizer Approves Attendee Registration', async ({ page }) => {
    await login(page, 'chaminda@gmail.com', '123456', 'organizer');
    await page.goto(`${BASE_URL}/organizer/registrations`);
    const row = page.locator('tr').filter({ hasText: eventName }).filter({ hasText: 'E2E Tester' }).first();
    
    page.on('dialog', d => d.accept());
    await row.locator('button:has-text("Approve")').click();
    await expect(row.locator('.status-badge')).toContainText('Approved');
  });

  test('13. User Invitation & QR Modal View', async ({ page }) => {
    await login(page, 'user@gmail.com', '123456', 'user');
    await page.goto(`${BASE_URL}/user/tickets`);
    const card = page.locator('.glass-panel').filter({ hasText: eventName }).first();
    await card.locator('button.btn-view-ticket').click();
    await expect(page.locator('.qr-display-container')).toBeVisible();
  });

  test('14. Chatbox Interaction Verification', async ({ page }) => {
    await login(page, 'chaminda@gmail.com', '123456', 'organizer');
    await page.goto(`${BASE_URL}/organizer/messages`);
    const input = page.locator('input[placeholder*="message"], textarea').first();
    if (await input.count()) {
      const msg = `AutoMsg-${timestamp}`;
      await input.fill(msg);
      await page.click('button[type="submit"], button:has-text("Send")');
      await expect(page.locator('body')).toContainText(msg);
    }
  });

  test('15. Final Status & Logout Check', async ({ page }) => {
    await login(page, 'chaminda@gmail.com', '123456', 'organizer');
    await page.goto(`${BASE_URL}/organizer/events`);
    const row = page.locator('tr').filter({ hasText: eventName }).first();
    await expect(row.locator('.status-badge')).toContainText('Approved');
    
    await page.click('.profile-toggle, .user-profile');
    await page.click('button:has-text("Logout"), .logout-btn');
    await expect(page).toHaveURL(/login/);
  });
});
