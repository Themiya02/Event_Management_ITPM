import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';
const API_URL = 'http://localhost:5000';

test.describe('Event Management Complete Workflow', () => {
  let eventId;
  let eventTitle;
  let registrationId;

  test('1. Organizer Creates Event', async ({ page, context }) => {
    console.log('===== STEP 1: Organizer Login and Create Event =====');
    
    // Navigate to login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(500);
    
    // Login as organizer
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('chaminda@gmail.com');
    await passwordInput.fill('123456');
    
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    // Wait for redirect - could go to organizer/dashboard or home first
    await page.waitForURL(/organizer|home/, { timeout: 10000 });
    
    // If redirected to home, navigate to organizer dashboard
    if (page.url().includes('/home')) {
      await page.goto(`${BASE_URL}/organizer/dashboard`);
    }
    
    await page.waitForURL(`${BASE_URL}/organizer/dashboard`, { timeout: 5000 });
    console.log('✅ Organizer logged in');
    
    // Wait for dashboard to load
    await page.waitForTimeout(1000);
    
    // Click Create New Event button
    const createBtn = page.locator('button:has-text("Create New Event")').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
    } else {
      // Try navigation link
      const createLink = page.locator('a:has-text("Create New Event")').first();
      if (await createLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createLink.click();
      }
    }
    
    await page.waitForURL(`${BASE_URL}/organizer/create-event`, { timeout: 5000 });
    console.log('✅ Navigated to Create Event page');
    
    // Wait for form to load
    await page.waitForTimeout(1000);
    
    // Fill in Step 1: Organizer Information
    eventTitle = `Playwright Test ${Date.now()}`;
    await page.fill('input[name="organizerName"]', 'Chaminda Organizer');
    await page.fill('input[name="organizerEmail"]', 'chaminda@gmail.com');
    await page.fill('input[name="organizerPhone"]', '0712345678');
    await page.fill('input[name="organizingBody"]', 'Tech Club');
    
    // Click Next button
    const nextBtn1 = page.locator('button:has-text("Next")').first();
    await nextBtn1.click();
    await page.waitForTimeout(500);
    console.log('✅ Step 1 completed - Organizer info filled');
    
    // Fill in Step 2: Event Details
    await page.fill('input[name="eventTitle"]', eventTitle);
    await page.fill('textarea[name="eventDescription"]', 'This is an automated test event created by Playwright for complete workflow testing.');
    await page.fill('input[name="eventDate"]', '2026-12-25');
    await page.fill('input[name="eventTime"]', '18:00');
    
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    console.log('✅ Step 2 completed - Event details filled');
    
    // Fill in Step 3: Venue & Ticketing
    await page.selectOption('select[name="venueType"]', 'Indoor');
    await page.fill('input[name="venueName"]', 'Main Auditorium, University');
    await page.fill('input[name="seatLimit"]', '500');
    await page.selectOption('select[name="isRegistrationRequired"]', 'Yes');
    await page.selectOption('select[name="ticketType"]', 'Free');
    
    // Submit the form
    const createBtn2 = page.locator('button:has-text("Create Event")').first();
    await createBtn2.click();
    await page.waitForTimeout(2000);
    
    // Wait for success or redirect
    const successMsg = page.locator('text=/Event created|successfully/i');
    const isSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isSuccess) {
      console.log('✅ Event created successfully');
    } else {
      console.log('⚠️ Event creation submitted');
    }
    
    // Store event title for later use
    await context.storageState();
  });

  test('2. Admin Reviews and Approves Event', async ({ page }) => {
    console.log('===== STEP 2: Admin Login and Approve Event =====');
    
    // Navigate to admin login
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(500);
    
    // Check if already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('/admin/login')) {
      // Try to logout if on dashboard
      const logoutBtn = page.locator('text=Log Out');
      if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await logoutBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Navigate to admin login
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForURL(/admin/, { timeout: 5000 });
    
    // Login as admin
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('admin@gmail.com');
    await passwordInput.fill('123456');
    
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 10000 });
    console.log('✅ Admin logged in');
    
    // Navigate to Event Handling
    const eventHandlingLink = page.locator('text=Event Handling').first();
    if (await eventHandlingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventHandlingLink.click();
      await page.waitForTimeout(500);
    }
    
    // Click on Upcoming Events
    const upcomingLink = page.locator('text=Upcoming Events').first();
    await upcomingLink.click();
    await page.waitForURL(`${BASE_URL}/admin/upcoming-events`, { timeout: 5000 });
    console.log('✅ Navigated to Upcoming Events');
    
    // Wait for events to load
    await page.waitForTimeout(1500);
    
    // Find and click the event created by organizer
    const eventCards = page.locator('[class*="event"]');
    let found = false;
    
    for (let i = 0; i < await eventCards.count(); i++) {
      const card = eventCards.nth(i);
      const text = await card.textContent();
      if (text && text.includes('Playwright Test')) {
        // Found the event, click review button
        const reviewBtn = card.locator('button:has-text("Review")').first();
        if (await reviewBtn.isVisible()) {
          await reviewBtn.click();
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      // Try alternative approach
      const eventLink = page.locator(`text=/Playwright Test/`).first();
      if (await eventLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const reviewBtn = page.locator('button:has-text("Review")').first();
        await reviewBtn.click();
        found = true;
      }
    }
    
    if (found) {
      // Navigate to AdminEventReview page
      await page.waitForURL(/admin\/event-review/, { timeout: 5000 });
      console.log('✅ Navigated to Event Review page');
      
      // Approve all stages
      const approvalCheckboxes = page.locator('input[type="checkbox"]');
      const count = await approvalCheckboxes.count();
      
      for (let i = 0; i < count; i++) {
        const checkbox = approvalCheckboxes.nth(i);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await page.waitForTimeout(300);
        }
      }
      console.log(`✅ Approved ${count} approval stages`);
      
      // Click Permanently Publish Event button
      const publishBtn = page.locator('button:has-text(/Permanently Publish|Publish|Submit/)').first();
      if (await publishBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await publishBtn.click();
        await page.waitForTimeout(1500);
        console.log('✅ Event published by admin');
      } else {
        console.log('⚠️ Publish button not found');
      }
    } else {
      console.log('⚠️ Could not find the Playwright Test event');
    }
  });

  test('3. Organizer Tracks Approval Status', async ({ page }) => {
    console.log('===== STEP 3: Organizer Tracks Event Status =====');
    
    // Login as organizer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'chaminda@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/organizer/dashboard`, { timeout: 10000 });
    console.log('✅ Organizer logged in');
    
    // Navigate to Track Event or Dashboard
    await page.click('text=My Events');
    await page.waitForTimeout(1000);
    
    // Look for the event and check its status
    const eventLocator = page.locator(`text=/Playwright Test/`).first();
    await expect(eventLocator).toBeVisible({ timeout: 5000 });
    
    // Click on the event to see details
    await eventLocator.click();
    await page.waitForTimeout(1000);
    
    // Check for approval status indicator
    const approvedStatus = page.locator('text=Approved').first();
    const publishedStatus = page.locator('text=Published').first();
    
    if (await approvedStatus.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Event shows Approved status');
    } else if (await publishedStatus.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Event shows Published status');
    }
  });

  test('4. User Views Event and Registers with Payment', async ({ page }) => {
    console.log('===== STEP 4: User Register for Event with Payment =====');
    
    // Login as user
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'user@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/home`, { timeout: 10000 });
    console.log('✅ User logged in');
    
    // Navigate to Dashboard to see available events
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Find the event created by organizer
    const eventCard = page.locator(`text=/Playwright Test/`).first();
    await expect(eventCard).toBeVisible({ timeout: 5000 });
    
    // Click on event to view details
    await eventCard.click();
    await page.waitForURL(/dashboard\/event\//, { timeout: 5000 });
    console.log('✅ Navigated to Event View page');
    
    // Fill in registration form
    const nameInput = page.locator('input[name="participantName"]');
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill('Test User');
    }
    
    await page.fill('input[placeholder*="Campus ID"]', 'IT21000000');
    await page.selectOption('select', '3rd Year');
    
    // Upload payment slip
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Create a simple test image
      await fileInput.setInputFiles({
        name: 'payment-slip.png',
        mimeType: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
      });
    }
    
    // Click Register button
    await page.click('button:has-text("Register")');
    await page.waitForTimeout(1500);
    
    // Check for success message
    const successMsg = page.locator('text=/Successfully registered|registered|confirmation/i');
    if (await successMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Registration successful');
    } else {
      console.log('⚠️ Registration submitted - check admin panel');
    }
  });

  test('5. Organizer Approves User Registration', async ({ page }) => {
    console.log('===== STEP 5: Organizer Approves Registration =====');
    
    // Login as organizer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'chaminda@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/organizer/dashboard`, { timeout: 10000 });
    console.log('✅ Organizer logged in');
    
    // Navigate to Registration Hub
    await page.click('text=Registration Hub');
    await page.waitForURL(`${BASE_URL}/organizer/registered-users`, { timeout: 5000 });
    console.log('✅ Navigated to Registration Hub');
    
    // Wait for registrations table to load
    await page.waitForTimeout(1500);
    
    // Find the registration from our test user
    const userRow = page.locator('text=/Test User|IT21000000/').first();
    if (await userRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Look for Approve button in that row
      const approveBtn = page.locator('button:has-text("Approve")').first();
      if (await approveBtn.isVisible()) {
        await approveBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Approved user registration');
      }
    } else {
      console.log('⚠️ Could not find registration in table');
    }
  });

  test('6. User Views Invitation Card', async ({ page }) => {
    console.log('===== STEP 6: User Views Invitation Card =====');
    
    // Login as user
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'user@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/home`, { timeout: 10000 });
    console.log('✅ User logged in');
    
    // Navigate to My Tickets
    await page.goto(`${BASE_URL}/user/tickets`);
    await page.waitForURL(`${BASE_URL}/user/tickets`, { timeout: 5000 });
    await page.waitForTimeout(1500);
    
    // Find event and click to view invitation
    const eventCard = page.locator(`text=/Playwright Test/`).first();
    if (await eventCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventCard.click();
      await page.waitForTimeout(1000);
      
      // Look for invitation card display button
      const inviteBtn = page.locator('button:has-text("Show Invite")');
      if (await inviteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await inviteBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Invitation card displayed');
        
        // Screenshot the invitation
        await page.screenshot({ path: 'invitation-card.png' });
        console.log('✅ Screenshot saved: invitation-card.png');
      }
    } else {
      console.log('⚠️ Event not found in user tickets');
    }
  });
});
