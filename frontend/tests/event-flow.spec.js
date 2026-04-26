import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe.serial('Complete Event Lifecycle', () => {
  test.setTimeout(300000); // 5 minutes for the whole lifecycle
  
  let eventName = `Music Fest ${Date.now()}`;
  let venueName = `Venue ${Date.now()}`;

  test('Should complete the entire event workflow', async ({ page }) => {
    // 1. LOGIN AS ORGANIZER
    console.log('🔑 Logging in as Organizer...');
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'organizer');
    await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForURL(/organizer\/dashboard/);
    console.log('✅ Organizer Logged In');

    // 2. CREATE EVENT
    console.log('📅 Creating Event...');
    await page.goto(`${BASE_URL}/organizer/create-event`);
    
    // Step 1
    await page.fill('input[name="organizerName"]', 'Chaminda');
    await page.fill('input[name="organizerEmail"]', 'chaminda@gmail.com');
    await page.fill('input[name="organizerPhone"]', '0712345678');
    await page.fill('input[name="organizingBody"]', 'ITPM Club');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000); // Wait for animation
    
    // Step 2
    await page.fill('input[name="eventTitle"]', eventName);
    await page.fill('textarea[name="eventDescription"]', 'A grand musical night');
    await page.fill('input[name="eventDate"]', '2026-05-10');
    await page.fill('input[name="eventTime"]', '18:00');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Step 3
    await page.fill('input[name="venueName"]', venueName);
    await page.locator('.radio-card').filter({ hasText: 'Indoor' }).click({ force: true });
    await page.waitForSelector('input[name="seatLimit"]');
    await page.fill('input[name="seatLimit"]', '500');
    await page.locator('.radio-card').filter({ hasText: 'Free Ticket' }).click({ force: true });
    
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Launch Event")');
    await page.waitForURL(/organizer\/track/);
    console.log('✅ Event Created Successfully');

    // 3. VERIFY IN TRACKING
    console.log('🔍 Checking Tracking page...');
    await page.waitForLoadState('networkidle');
    const trackSelect = page.locator('select.select-event');
    await expect(trackSelect).toContainText(eventName, { timeout: 30000 });
    console.log('✅ Event verified in tracking page');

    // 4. VERIFY IN EVENTS LIST
    console.log('📋 Checking Events List...');
    await page.goto(`${BASE_URL}/organizer/events`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tr').filter({ hasText: eventName }).first()).toBeVisible({ timeout: 20000 });
    console.log('✅ Event verified in events list');

    // 5. LOGIN AS ADMIN AND APPROVE
    console.log('🛡️ Logging in as Admin...');
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'admin');
    await page.fill('input[placeholder="Enter Email"]', 'admin@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForURL(/admin\/dashboard/);
    
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    await page.waitForLoadState('networkidle');
    const eventRow = page.locator('tr').filter({ hasText: eventName }).first();
    await expect(eventRow).toBeVisible({ timeout: 15000 });
    
    // Admin 4-step approval checkboxes
    const checkboxes = eventRow.locator('input[type="checkbox"]');
    for (let i = 0; i < 4; i++) {
        await checkboxes.nth(i).check();
        await page.waitForTimeout(500);
    }
    
    await eventRow.locator('button:has-text("Approve")').click();
    console.log('✅ Event Approved by Admin');
    await page.waitForTimeout(3000);

    // 6. LOGIN AS USER AND REGISTER
    console.log('👤 Logging in as User...');
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'user');
    await page.fill('input[placeholder="Enter Email"]', 'user@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForURL(/dashboard/);
    
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    const eventCard = page.locator('.event-card').filter({ hasText: eventName }).first();
    await expect(eventCard).toBeVisible({ timeout: 15000 });
    await eventCard.locator('button:has-text("Register")').click();
    
    await page.fill('input[name="participantName"]', 'Test User');
    await page.fill('input[name="campusId"]', 'IT20123456');
    await page.selectOption('select[name="campusYear"]', 'Year 3');
    await page.click('button:has-text("Confirm Registration")');
    console.log('✅ User Registered for Event');
    await page.waitForTimeout(3000);

    // 7. ORGANIZER APPROVES REGISTRATION
    console.log('⚙️ Finalizing: Organizer approving user...');
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'organizer');
    await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForURL(/organizer\/dashboard/);
    
    await page.goto(`${BASE_URL}/organizer/registrations`);
    await page.waitForLoadState('networkidle');
    const regRow = page.locator('tr').filter({ hasText: 'Test User' }).filter({ hasText: eventName }).first();
    await expect(regRow).toBeVisible({ timeout: 15000 });
    await regRow.locator('button:has-text("Approve")').click();
    console.log('✅ Registration Approved');
    
    console.log('🎉 COMPREHENSIVE FLOW PASSED!');
  });
});
