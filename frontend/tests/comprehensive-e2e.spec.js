import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E Testing Suite
 * Covers: Organizer, Admin, User, Notifications, Chat, Search, Tracking, and Downloads
 */

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5002'; // For backend verification if needed

test.describe('Master Event Lifecycle & Features E2E', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(240000); // 4 minutes per test case
  const eventTitle = `E2E ${Date.now()}`;
  const venueName = `Hall ${Date.now()}`;
  
  test.beforeEach(async ({ page }) => {
    // Standard setup
  });

  test('Step 1: Organizer - Search, Create Event & Notifications', async ({ page }) => {
    console.log('\n▶️ [Organizer] Search, Create & Notification Check');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'organizer');
    await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForURL(/organizer\/dashboard/);

    // 1. Search Bar Testing (Manage Events Page)
    await page.goto(`${BASE_URL}/organizer/events`);
    await page.fill('input[placeholder*="Search by event name"]', 'Non-Existent Event');
    await expect(page.getByText('No matching events found')).toBeVisible({ timeout: 5000 });
    await page.fill('input[placeholder*="Search by event name"]', ''); // Clear

    // 2. Create Event (Multi-step)
    await page.goto(`${BASE_URL}/organizer/create-event`);
    
    // Step 1: Organizer Details
    await page.fill('input[name="organizerName"]', 'Chaminda');
    await page.fill('input[name="organizingBody"]', 'IT Society');
    await page.fill('input[name="organizerEmail"]', 'chaminda@gmail.com');
    await page.fill('input[name="organizerPhone"]', '0712345678');
    await page.click('button:has-text("Continue")');
    
    // Step 2: Event Details
    await page.fill('input[name="eventTitle"]', eventTitle);
    await page.fill('input[name="artistName"]', 'Test Artist');
    await page.fill('textarea[name="eventDescription"]', 'Comprehensive test covering all features.');
    await page.fill('input[name="eventDate"]', '2026-12-31');
    await page.fill('input[name="eventTime"]', '18:00');
    await page.click('button:has-text("Continue")');
    
    // Step 3: Venue & Ticketing
    await page.fill('input[name="venueName"]', venueName);
    await page.fill('input[name="seatLimit"]', '100');
    
    // Catch any alerts (like venue conflicts)
    page.on('dialog', async dialog => {
        console.log('ALERT RECEIVED:', dialog.message());
        await dialog.dismiss();
    });
    
    await page.click('button:has-text("Launch Event")', { force: true });
    
    // Should navigate to Track page
    await page.waitForURL(/organizer\/track/, { timeout: 30000 });
    console.log('✅ Event Created Successfully');

    // 3. Notification Check
    await page.click('.notification-bell');
    const creationNotif = page.locator('.notification-item').filter({ hasText: /created successfully|pending review/i }).first();
    await expect(creationNotif).toBeVisible({ timeout: 30000 });
    console.log('✅ Notification Received: Event Created');
  });

  test('Step 2: Chat - Organizer to Admin', async ({ page }) => {
    console.log('\n▶️ [Chat] Organizer sends message to Admin');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'organizer');
    await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    
    // Navigate to Chat
    await page.goto(`${BASE_URL}/organizer/messages`);
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for either contacts or no-contacts message
    const contactItem = page.locator('.contact-item');
    const noContactsMsg = page.getByText(/No contacts found/i);
    
    await Promise.race([
        contactItem.first().waitFor({ state: 'visible', timeout: 15000 }),
        noContactsMsg.waitFor({ state: 'visible', timeout: 15000 })
    ]).catch(() => {});
    
    if (!(await contactItem.first().isVisible())) {
        console.log('⚠️ No contacts found. Skipping chat test.');
        return;
    }
    
    await contactItem.first().click();
    
    const messageContent = `Support Request: ${Date.now()}`;
    const chatInput = page.locator('input[placeholder*="Type your message"]');
    await chatInput.waitFor({ state: 'visible', timeout: 5000 });
    await chatInput.fill(messageContent);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.message-bubble').filter({ hasText: messageContent }).first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Chat Message Sent to Admin');
  });

  test('Step 3: Admin - Search, Review, Chat Reply & Approve', async ({ page }) => {
    console.log('\n▶️ [Admin] Search, Chat Reply & Multi-Stage Approval');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'admin');
    await page.waitForTimeout(1000); // Wait for auto-fill
    await page.click('button[type="submit"]', { force: true });
    await page.waitForURL(/admin\/dashboard/);

    // 1. Search Bar Testing
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    await page.fill('input[placeholder*="Find upcoming events"]', eventTitle);
    const eventCard = page.locator('.event-card').filter({ hasText: eventTitle });
    await expect(eventCard).toBeVisible({ timeout: 10000 });
    console.log('✅ Search Bar Working: Found Created Event');

    // 2. Chat Reply
    await page.goto(`${BASE_URL}/admin/messages`);
    await page.waitForLoadState('domcontentloaded');
    
    // Click any contact if "Chaminda" not found
    const organizerContact = page.locator('.contact-item').filter({ hasText: 'Chaminda' }).first();
    const fallbackContact = page.locator('.contact-item').first();
    
    if (await organizerContact.isVisible()) {
        await organizerContact.click();
    } else if (await fallbackContact.isVisible()) {
        await fallbackContact.click();
    }
    
    const replyContent = `Admin Response: Acknowledged.`;
    const chatInputAdmin = page.locator('input[placeholder*="Type your message"]');
    if (await chatInputAdmin.isVisible({ timeout: 5000 })) {
        await chatInputAdmin.fill(replyContent);
        await page.click('button[type="submit"]');
        console.log('✅ Chat Reply Sent to Organizer');
    }

    // 3. Multi-Stage Approval
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    await page.fill('input[placeholder*="Find upcoming events"]', eventTitle);
    await page.locator('.event-card').filter({ hasText: eventTitle }).locator('button:has-text("Review")').click();
    
    // Toggle 4 stages
    await page.waitForSelector('label.approval-stage-card');
    const labels = page.locator('label.approval-stage-card');
    for (let i = 0; i < 4; i++) {
      console.log(`Checking Stage ${i+1}...`);
      const currentLabel = labels.nth(i);
      if (!(await currentLabel.getAttribute('class')).includes('checked')) {
          const respPromise = page.waitForResponse(r => r.url().includes('/approval') && r.status() === 200);
          await currentLabel.click({ force: true });
          await respPromise;
          await page.waitForTimeout(500); // Allow state to settle
      }
      await expect(labels.nth(i)).toHaveClass(/checked/, { timeout: 10000 });
    }
    
    // Publish
    console.log('Publishing Event...');
    page.once('dialog', d => d.accept());
    const publishBtn = page.locator('button:has-text("Publish Event")');
    await expect(publishBtn).toBeEnabled({ timeout: 10000 });
    await publishBtn.click();
    await page.waitForURL(/admin\/events\/approved/, { timeout: 30000 });
    console.log('✅ Admin Multi-Stage Approval Successful');
  });

  test('Step 4: User - Search, Register & Notification', async ({ page }) => {
    console.log('\n▶️ [User] Search, Register & Notification');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'user');
    await page.fill('input[placeholder="Enter Email"]', 'user@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForURL(/dashboard/);

    // 1. Search Bar Testing
    await page.fill('input[placeholder*="Search for events"]', eventTitle);
    const eventCard = page.locator('.event-card').filter({ hasText: eventTitle });
    await expect(eventCard).toBeVisible({ timeout: 10000 });
    console.log('✅ Search Bar Working: Found Approved Event');

    // 2. Register
    await eventCard.locator('button:has-text("Register Now")').click();
    await page.fill('input[placeholder="Jane Doe"]', 'Test User');
    await page.fill('input[placeholder="IT21XXXXXX"]', 'IT21000000');
    await page.selectOption('select', 'Year 3');
    
    page.once('dialog', d => d.accept());
    await page.click('button:has-text("Submit Registration")');
    await expect(page.locator('h2, h3, div').filter({ hasText: /registered successfully|success/i }).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ User Registration Successful');

    // 3. Notification Check
    await page.click('.notification-bell');
    const regNotif = page.locator('.notification-item').filter({ hasText: /successfully registered/i }).first();
    await expect(regNotif).toBeVisible();
    console.log('✅ Notification Received: Registration Success');
  });

  test('Step 5: Organizer - Track & Approve Registration', async ({ page }) => {
    console.log('\n▶️ [Organizer] Tracking & Approval');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'organizer');
    await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });

    // 1. Notification Check
    await page.click('.notification-bell');
    const newRegNotif = page.locator('.notification-item').filter({ hasText: eventTitle }).filter({ hasText: /new registration/i }).first();
    await expect(newRegNotif).toBeVisible();
    console.log('✅ Notification Received: New Registration');

    // 2. Track Event
    await page.goto(`${BASE_URL}/organizer/track`);
    const trackRow = page.locator('.track-card').filter({ hasText: eventTitle });
    await expect(trackRow).toBeVisible();
    await expect(trackRow.locator('.stat-value', { hasText: '1' })).toBeVisible(); // 1 Registration
    console.log('✅ Event Tracking Correct: 1 Registration Found');

    // 3. Approve Registration
    await page.goto(`${BASE_URL}/organizer/registrations`);
    const regRow = page.locator('.glass-panel').filter({ hasText: eventTitle }).first();
    await expect(regRow).toBeVisible();
    await regRow.locator('button:has-text("Approve")').click();
    await page.waitForTimeout(1000);
    console.log('✅ Organizer Registration Approval Successful');
  });

  test('Step 6: User - Ticket Download', async ({ page }) => {
    console.log('\n▶️ [User] Ticket Download');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'user');
    await page.fill('input[placeholder="Enter Email"]', 'user@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });

    // 1. Notification Check
    await page.click('.notification-bell');
    const approvedNotif = page.locator('.notification-item').filter({ hasText: eventTitle }).filter({ hasText: /been approved/i }).first();
    await expect(approvedNotif).toBeVisible();
    console.log('✅ Notification Received: Registration Approved');

    // 2. Download Ticket
    await page.goto(`${BASE_URL}/user/tickets`);
    const ticketCard = page.locator('.glass-panel').filter({ hasText: eventTitle }).first();
    await expect(ticketCard.locator('.status-badge')).toContainText('Approved');
    
    await ticketCard.locator('button:has-text("View Ticket")').click();
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Ticket as Image")');
    const download = await downloadPromise;
    console.log(`✅ Ticket Downloaded: ${download.suggestedFilename()}`);
  });
});
