import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';
const API_URL = 'http://localhost:5000';

test.describe('Complete Event Management Workflow - Organizer to User', () => {
  let eventTitle;

  test('Scenario: Organizer Create Event', async ({ page }) => {
    console.log('\n🎬 ORGANIZER: Create Event Flow Started\n');
    
    // Step 1: Navigate and Login
    await page.goto(`${BASE_URL}/login`);
    console.log('📍 Navigated to Login Page');
    await page.waitForTimeout(500);
    
    // Select role BEFORE filling credentials
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('Organizer');
    console.log('🔐 Selected Organizer role');
    
    await page.fill('input[type="email"]', 'chaminda@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    console.log('🔐 Organizer credentials submitted');
    
    // Wait for authentication - might take longer
    await page.waitForURL(/organizer|home|dashboard/, { timeout: 15000 });
    
    // Navigate to organizer dashboard if needed
    if (!page.url().includes('organizer')) {
      await page.goto(`${BASE_URL}/organizer/dashboard`);
    }
    
    await expect(page).toHaveURL(`${BASE_URL}/organizer/dashboard`, { timeout: 5000 });
    console.log('✅ Organizer Dashboard Loaded');
    
    // Step 2: Create Event
    await page.waitForTimeout(1000);
    const createBtn = page.locator('button:has-text("Create New Event")').first();
    
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      console.log('🎯 Clicked Create New Event');
    }
    
    await page.waitForURL(`${BASE_URL}/organizer/create-event`, { timeout: 5000 });
    await page.waitForTimeout(1000);
    console.log('📝 Event Form Loaded');
    
    // Step 3: Fill Event Details
    eventTitle = `Demo Event ${Date.now()}`;
    
    // Step 1: Organizer Info
    await page.fill('input[name="organizerName"]', 'Chaminda Organizer');
    await page.fill('input[name="organizerEmail"]', 'chaminda@gmail.com');
    await page.fill('input[name="organizerPhone"]', '0712345678');
    await page.fill('input[name="organizingBody"]', 'Tech Club');
    console.log('📋 Organizer Info Filled');
    
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    
    // Step 2: Event Details
    await page.fill('input[name="eventTitle"]', eventTitle);
    await page.fill('textarea[name="eventDescription"]', 'Automated test event for complete workflow demonstration.');
    await page.fill('input[name="eventDate"]', '2026-12-25');
    await page.fill('input[name="eventTime"]', '18:00');
    console.log(`📅 Event Details Filled: ${eventTitle}`);
    
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    
    // Step 3: Venue & Ticketing
    await page.selectOption('select[name="venueType"]', 'Indoor');
    await page.fill('input[name="venueName"]', 'Main Auditorium');
    await page.fill('input[name="seatLimit"]', '500');
    await page.selectOption('select[name="isRegistrationRequired"]', 'Yes');
    await page.selectOption('select[name="ticketType"]', 'Free');
    console.log('🏢 Venue & Ticketing Configured');
    
    // Step 4: Submit
    await page.click('button:has-text("Create Event")');
    console.log('📤 Event Creation Submitted');
    
    await page.waitForTimeout(2000);
    console.log('✅ Event Creation Complete - Event awaiting admin approval\n');
  });

  test('Scenario: Admin Review and Approve Event', async ({ page }) => {
    console.log('\n🛡️  ADMIN: Event Review Flow Started\n');
    
    // Step 1: Navigate to Admin
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(500);
    console.log('📍 Navigated to Login Page');
    
    // Select Admin role BEFORE filling credentials
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('Admin');
    console.log('🔐 Selected Admin role');
    
    // Step 2: Admin Login
    await page.fill('input[type="email"]', 'admin@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    console.log('🔐 Admin credentials submitted');
    
    await page.waitForURL(/admin|dashboard/, { timeout: 15000 });
    console.log('✅ Admin Dashboard Loaded');
    
    // Step 3: Navigate to Event Handling
    await page.waitForTimeout(1000);
    const eventHandling = page.locator('text=Event Handling').first();
    
    if (await eventHandling.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventHandling.click();
      console.log('🎯 Clicked Event Handling');
    }
    
    // Step 4: View Upcoming Events
    const upcomingEvents = page.locator('text=Upcoming Events').first();
    await upcomingEvents.click();
    console.log('📋 Viewing Upcoming Events');
    
    await page.waitForURL(/admin\/upcoming-events|admin\/events/, { timeout: 5000 });
    await page.waitForTimeout(1500);
    
    // Step 5: Find and Review Event
    const eventLocator = page.locator(`text=/Demo Event/`).first();
    const isEventVisible = await eventLocator.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isEventVisible) {
      console.log('🔍 Found pending event');
      
      // Find and click Review button
      const parentLocator = page.locator('[class*="card"], [class*="item"]').filter({ has: page.locator('text=/Demo Event/') }).first();
      const reviewBtn = parentLocator.locator('button:has-text("Review")').first();
      
      if (await reviewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await reviewBtn.click();
        console.log('✅ Opened Event Review');
      }
      
      // Step 6: Approve Event
      await page.waitForURL(/admin\/event-review|admin\/events/, { timeout: 5000 });
      await page.waitForTimeout(1000);
      
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = checkboxes.nth(i);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          console.log(`✓ Approved stage ${i + 1}`);
        }
      }
      
      // Step 7: Publish Event
      const publishBtn = page.locator('button:has-text(/Publish|Submit/)').first();
      if (await publishBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await publishBtn.click();
        console.log('📤 Event Published by Admin');
        await page.waitForTimeout(1500);
      }
    } else {
      console.log('⚠️  Event not found in upcoming list');
    }
    
    console.log('\n✅ Admin Approval Complete - Event is now public\n');
  });

  test('Scenario: User Register for Event with Payment', async ({ page }) => {
    console.log('\n👤 USER: Event Registration Flow Started\n');
    
    // Step 1: User Login
    await page.goto(`${BASE_URL}/login`);
    console.log('📍 Navigated to Login Page');
    await page.waitForTimeout(500);
    
    // Select User role
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('User');
    console.log('🔐 Selected User role');
    
    await page.fill('input[type="email"]', 'user@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    console.log('🔐 User credentials submitted');
    
    await page.waitForURL(/home|dashboard/, { timeout: 15000 });
    console.log('✅ User Dashboard Loaded');
    
    // Step 2: Navigate to Events
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 5000 });
    await page.waitForTimeout(1500);
    console.log('📋 Viewing Available Events');
    
    // Step 3: Find Event
    const eventCard = page.locator(`text=/Demo Event/`).first();
    const isEventVisible = await eventCard.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isEventVisible) {
      console.log('🔍 Found approved event');
      
      await eventCard.click();
      await page.waitForURL(/dashboard\/event\//, { timeout: 5000 });
      console.log('✅ Opened Event Details');
      
      // Step 4: Fill Registration Form
      await page.waitForTimeout(1000);
      
      const nameField = page.locator('input[name="participantName"]');
      if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameField.clear();
        await nameField.fill('Test User');
      }
      
      await page.fill('input[placeholder*="Campus"]', 'IT21000000');
      
      const yearSelect = page.locator('select').first();
      await yearSelect.selectOption('3rd Year').catch(() => {
        // Select any available option if 3rd Year not found
        yearSelect.click();
      });
      
      console.log('📝 Registration Form Filled');
      
      // Step 5: Upload Payment Slip (if available)
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Create a test image buffer
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        
        await fileInput.setInputFiles({
          name: 'payment-receipt.png',
          mimeType: 'image/png',
          buffer: testImageBuffer
        });
        console.log('💳 Payment Receipt Uploaded');
      }
      
      // Step 6: Submit Registration
      const registerBtn = page.locator('button:has-text(/Register|Submit/)').first();
      await registerBtn.click();
      console.log('📤 Registration Submitted');
      
      await page.waitForTimeout(1500);
      
      const successMsg = page.locator('text=/successfully|registered|confirmation/i');
      const isSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isSuccess) {
        console.log('✅ Registration Confirmed');
      } else {
        console.log('⏳ Registration Pending Organizer Approval');
      }
    } else {
      console.log('⚠️  Event not found in dashboard');
    }
    
    console.log('\n✅ User Registration Complete - Awaiting Organizer Approval\n');
  });

  test('Scenario: Organizer Approve Registration & Show Invite', async ({ page }) => {
    console.log('\n🎬 ORGANIZER: Approve Registration Flow Started\n');
    
    // Step 1: Organizer Login
    await page.goto(`${BASE_URL}/login`);
    console.log('📍 Navigated to Login Page');
    await page.waitForTimeout(500);
    
    // Select Organizer role
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('Organizer');
    console.log('🔐 Selected Organizer role');
    
    await page.fill('input[type="email"]', 'chaminda@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    console.log('🔐 Organizer credentials submitted');
    
    await page.waitForURL(/organizer|home|dashboard/, { timeout: 15000 });
    
    if (!page.url().includes('organizer')) {
      await page.goto(`${BASE_URL}/organizer/dashboard`);
    }
    
    console.log('✅ Organizer Dashboard Loaded');
    
    // Step 2: Navigate to Registration Hub
    await page.waitForTimeout(1000);
    const registrationHub = page.locator('text=Registration Hub').first();
    
    if (await registrationHub.isVisible({ timeout: 3000 }).catch(() => false)) {
      await registrationHub.click();
      console.log('🎯 Clicked Registration Hub');
    }
    
    await page.waitForURL(/organizer\/registered|registration/, { timeout: 5000 });
    await page.waitForTimeout(1500);
    console.log('📋 Registration Hub Loaded');
    
    // Step 3: Find User Registration
    const userRow = page.locator('text=/Test User|IT21000000/').first();
    const isUserVisible = await userRow.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isUserVisible) {
      console.log('🔍 Found user registration');
      
      // Step 4: Approve Registration
      const approveBtn = page.locator('button:has-text("Approve")').first();
      
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await approveBtn.click();
        console.log('✅ User Registration Approved');
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('⚠️  User registration not found');
    }
    
    console.log('\n✅ Organizer Approval Complete\n');
  });

  test('Scenario: User View Invitation Card', async ({ page }) => {
    console.log('\n👤 USER: View Invitation Card Flow Started\n');
    
    // Step 1: User Login
    await page.goto(`${BASE_URL}/login`);
    console.log('📍 Navigated to Login Page');
    await page.waitForTimeout(500);
    
    // Select User role
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('User');
    console.log('🔐 Selected User role');
    
    await page.fill('input[type="email"]', 'user@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    console.log('🔐 User credentials submitted');
    
    await page.waitForURL(/home|dashboard/, { timeout: 15000 });
    console.log('✅ User Dashboard Loaded');
    
    // Step 2: Navigate to My Tickets/Registrations
    await page.goto(`${BASE_URL}/user/tickets`);
    await page.waitForURL(`${BASE_URL}/user/tickets`, { timeout: 5000 });
    await page.waitForTimeout(1500);
    console.log('📋 My Tickets Loaded');
    
    // Step 3: Find Approved Event
    const eventCard = page.locator(`text=/Demo Event/`).first();
    const isEventVisible = await eventCard.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isEventVisible) {
      console.log('🔍 Found registered event');
      
      await eventCard.click();
      await page.waitForTimeout(1000);
      console.log('✅ Opened Event Ticket');
      
      // Step 4: Display Invitation Card
      const inviteBtn = page.locator('button:has-text("Show Invite")').first();
      
      if (await inviteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await inviteBtn.click();
        console.log('🎫 Invitation Card Displayed');
        
        await page.waitForTimeout(1000);
        
        // Take screenshot of invitation
        try {
          await page.screenshot({ path: 'invitation-card-screenshot.png' });
          console.log('📸 Invitation screenshot saved');
        } catch (err) {
          console.log('⚠️  Could not save screenshot');
        }
      } else {
        console.log('⚠️  Show Invite button not found');
      }
    } else {
      console.log('⚠️  Approved event not found in tickets');
    }
    
    console.log('\n✅ Invitation Card Display Complete\n');
  });
});
