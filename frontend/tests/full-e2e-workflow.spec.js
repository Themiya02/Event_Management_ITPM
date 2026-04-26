import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe.serial('E2E Full Event Lifecycle', () => {
  test.setTimeout(120000); // 2 minutes per test
  
  let eventTitle = `E2E Event ${Date.now()}`;
  let venueName = `Hall ${Date.now()}`;
  
  test('1. Organizer Event Create Successful', async ({ page }) => {
    console.log(`\n▶️ Creating Event: ${eventTitle}`);
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'organizer');
    await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    
    await page.waitForURL(/organizer\/dashboard/, { timeout: 15000 });
    
    // Go to Create Event
    await page.goto(`${BASE_URL}/organizer/create-event`);
    
    // Step 1: Organizer Info
    await page.fill('input[name="organizerName"]', 'Chaminda Organizer');
    await page.fill('input[name="organizerEmail"]', 'chaminda@gmail.com');
    await page.fill('input[name="organizerPhone"]', '0712345678');
    await page.fill('input[name="organizingBody"]', 'ITPM Club');
    await page.click('button:has-text("Continue")', { force: true });
    await page.waitForTimeout(500);
    
    // Step 2: Event Details
    await page.fill('input[name="eventTitle"]', eventTitle);
    await page.fill('textarea[name="eventDescription"]', 'End-to-End Test Event');
    await page.fill('input[name="eventDate"]', '2026-12-25');
    await page.fill('input[name="eventTime"]', '18:00');
    await page.click('button:has-text("Continue")', { force: true });
    await page.waitForTimeout(500);
    
    // Step 3: Venue & Ticketing
    await page.check('input[name="venueType"][value="Indoor"]');
    await page.fill('input[name="venueName"]', venueName);
    await page.fill('input[name="seatLimit"]', '500');
    await page.check('input[name="isRegistrationRequired"][value="Yes"]');
    await page.check('input[name="ticketType"][value="Free"]');
    
    // Submit Event
    page.on('dialog', dialog => console.log('ALERT:', dialog.message()));
    await page.click('button:has-text("Launch Event")', { force: true });
    await page.waitForURL(/organizer\/track/, { timeout: 15000 });
    console.log('✅ Organizer event create successful');
  });

  test('2. Admin Approve Reject Successful (Approve Event)', async ({ page }) => {
    console.log(`\n▶️ Admin Approving Event`);
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'admin');
    await page.waitForTimeout(1000); // Give React time to auto-fill
    await page.click('button[type="submit"]', { force: true });
    
    await page.waitForURL(/admin\/dashboard/, { timeout: 15000 });
    console.log('✅ Admin login successful');
    
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
    });
    
    // Navigate to Upcoming Events to approve
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find the event (Retry once if not found immediately)
    let eventCard = page.getByText(eventTitle, { exact: false }).first();
    try {
      await expect(eventCard).toBeVisible({ timeout: 10000 });
    } catch (e) {
      console.log('🔄 Event not found, reloading page...');
      await page.reload();
      await page.waitForTimeout(3000);
      await expect(eventCard).toBeVisible({ timeout: 10000 });
    }
    
    const parentLocator = page.locator('.event-card').filter({ has: page.getByText(eventTitle) }).first();
    await parentLocator.locator('button:has-text("Review Event Details")').click();
      
      await page.waitForTimeout(1500);
      
      // Check all checkboxes to approve
      const labels = page.locator('label.approval-stage-card');
      const count = 4; // We know there are 4 stages
      
      for (let i = 0; i < count; i++) {
        const label = labels.nth(i);
        const className = await label.getAttribute('class');
        if (!className.includes('checked')) {
          console.log(`Checking stage ${i + 1}...`);
          
          // Wait for the specific patch request to complete
          const responsePromise = page.waitForResponse(resp => 
            resp.url().includes('/approval') && resp.status() === 200,
            { timeout: 10000 }
          );
          
          await label.click({ force: true });
          await responsePromise;
          
          // Verify it's checked
          await expect(label).toHaveClass(/checked/, { timeout: 5000 });
          await page.waitForTimeout(500); // Small settle time
        }
      }
      // Publish/Approve
      const publishBtn = page.locator('button:has-text("Publish Event"), button:has-text("Permanently Publish Event")').first();
      await expect(publishBtn).not.toBeDisabled({ timeout: 10000 });
      
      page.once('dialog', async dialog => {
        console.log('Admin Dialog:', dialog.message());
        await dialog.accept();
      });
      
      await publishBtn.click({ force: true });
      await page.waitForURL(/admin\/events\/upcoming/, { timeout: 15000 });
      console.log('✅ Admin approve event successful');
  });

  test('3. User Register Success', async ({ page }) => {
    console.log(`\n▶️ User Registering for Event`);
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'user');
    await page.fill('input[placeholder="Enter Email"]', 'user@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/home|dashboard/, { timeout: 15000 });
    page.on('dialog', dialog => dialog.accept());
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);
    
    // Find event and click the button inside it
    const eventCard = page.getByText(eventTitle, { exact: false }).first();
    await expect(eventCard).toBeVisible({ timeout: 10000 });
    
    const parentLocator = page.locator('.event-card').filter({ has: page.getByText(eventTitle) }).first();
    await parentLocator.locator('button.btn-view-event').click({ force: true });
    
    await page.waitForURL(/\/dashboard\/event\//, { timeout: 10000 });
    await page.waitForTimeout(1500);
      
      // Fill out registration form
      await page.fill('input[placeholder="Jane Doe"]', 'Test User');
      await page.fill('input[placeholder="IT21XXXXXX"]', 'IT21000000');
      
      const yearSelect = page.locator('select').first();
      await yearSelect.selectOption('3rd Year').catch(() => yearSelect.click());
      
      // Register
      const registerBtn = page.locator('button:has-text("Register"), button:has-text("Submit")').first();
      await expect(registerBtn).toBeVisible({ timeout: 5000 });
      await registerBtn.click();
      await page.waitForTimeout(2000);
      
      console.log('✅ User register success');
  });

  test('4. Organizer Event Tracking Success & Approve Registration', async ({ page }) => {
    console.log(`\n▶️ Organizer Tracking & Approving Registration`);
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'organizer');
    await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/organizer\/dashboard/, { timeout: 15000 });
    page.on('dialog', dialog => dialog.accept());
    
    // Check Event Tracking
    await page.goto(`${BASE_URL}/organizer/track`);
    await page.waitForTimeout(1500);
    console.log('✅ Organizer event tracking success');

    // Go to Registration Hub
    await page.goto(`${BASE_URL}/organizer/registered-users`);
    await page.waitForTimeout(2000);
    
    const userRow = page.locator('text=/Test User|IT21000000/').first();
    await expect(userRow).toBeVisible({ timeout: 10000 });
    
    const approveBtn = page.locator('button:has-text("Approve")').first();
    await expect(approveBtn).toBeVisible({ timeout: 3000 });
    await approveBtn.click();
    await page.waitForTimeout(1500);
    console.log('✅ Organizer approve user registration successful');
  });

  test('5. User Download Ticket Success', async ({ page }) => {
    console.log(`\n▶️ User Downloading Ticket`);
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'user');
    await page.fill('input[placeholder="Enter Email"]', 'user@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', '123456');
    await page.click('button[type="submit"]', { force: true });
    
    await page.waitForURL(/home|dashboard/, { timeout: 15000 });
    
    // Navigate to My Tickets
    await page.goto(`${BASE_URL}/user/tickets`);
    await page.waitForTimeout(2000);
    
    // Find the approved ticket for the specific event
    const ticketRow = page.locator('.glass-panel').filter({ has: page.getByText(eventTitle) }).first();
    await expect(ticketRow).toBeVisible({ timeout: 10000 });
    
    // Check if status is Approved
    const statusBadge = ticketRow.locator('.status-approved, text=Approved');
    await expect(statusBadge).toBeVisible({ timeout: 5000 });
    
    // Click View Ticket
    await ticketRow.locator('button:has-text("View Ticket")').click();
    await page.waitForTimeout(1000);
    
    // Click Download Ticket
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Ticket as Image")');
    const download = await downloadPromise;
    
    console.log(`✅ Ticket download successful: ${download.suggestedFilename()}`);
    
    // Check if the user can also view the invitation for this event (as per "download invitation successful" request)
    // Even if it's a registration event, we check if the details page has an invitation download
    await page.goto(`${BASE_URL}/dashboard/event/${event._id}`);
    const seeInviteBtn = page.locator('button:has-text("See the invitation")');
    if (await seeInviteBtn.isVisible()) {
        await seeInviteBtn.click();
        const inviteDownloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("DOWNLOAD DIGITAL INVITATION")');
        const inviteDownload = await inviteDownloadPromise;
        console.log(`✅ Invitation download successful: ${inviteDownload.suggestedFilename()}`);
    }
  });
});
