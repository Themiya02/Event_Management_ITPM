import { test, expect } from '@playwright/test';

// Test Configuration
const BASE_URL = 'http://localhost:5173';
const ORGANIZER_CREDENTIALS = { email: 'chaminda@gmail.com', password: '123456' };
const ADMIN_CREDENTIALS = { email: 'admin@gmail.com', password: '123456' };

test.describe('Event Handling Workflow', () => {
  
  test('Complete Event Lifecycle: Creation to Approval', async ({ page }) => {
    // 1. Login as Organizer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ORGANIZER_CREDENTIALS.email);
    await page.fill('input[type="password"]', ORGANIZER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Verify Organizer Dashboard
    await expect(page).toHaveURL(/.*organizer\/dashboard/);
    console.log('Successfully logged in as Organizer');

    // 2. Create a New Event (Stepper Form)
    await page.goto(`${BASE_URL}/organizer/create-event`);
    const eventName = `Test Event ${Date.now()}`;

    // Step 1: Organizer Details
    await page.fill('input[name="organizerName"]', 'Test Organizer');
    await page.fill('input[name="organizingBody"]', 'Test Club');
    await page.fill('input[name="organizerEmail"]', 'test@example.com');
    await page.fill('input[name="organizerPhone"]', '0711234567');
    await page.click('button:has-text("Continue")');

    // Step 2: Event Information
    await page.fill('input[name="eventTitle"]', eventName);
    await page.fill('input[name="artistName"]', 'Test Artist');
    await page.fill('textarea[name="eventDescription"]', 'This is a test event created by Playwright');
    await page.fill('input[name="eventDate"]', '2026-12-31');
    await page.fill('input[name="eventTime"]', '18:00');
    await page.click('button:has-text("Continue")');

    // Step 3: Venue & Ticketing
    await page.fill('input[name="venueName"]', 'Test Venue');
    await page.fill('input[name="seatLimit"]', '100');
    
    // Submit Event
    await page.click('button.btn-submit');
    
    // Verify redirection to tracking page
    await page.waitForURL(/.*organizer\/track/);
    console.log(`Event "${eventName}" created and pending review`);

    // 3. Logout
    await page.goto(`${BASE_URL}/login`); 

    // 4. Login as Admin
    await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*admin\/dashboard/);
    console.log('Successfully logged in as Admin');

    // 5. Navigate to Event Review
    await page.goto(`${BASE_URL}/admin/events/upcoming`);
    
    // Find the newly created event in the list (using card selector)
    const eventCard = page.locator(`.event-card:has-text("${eventName}")`);
    await expect(eventCard).toBeVisible();
    await eventCard.locator('button:has-text("Review Event Details")').click();

    // 6. Approve through all 4 stages
    const stages = ['security', 'medical', 'community', 'dean'];
    for (const stage of stages) {
      const checkbox = page.locator(`input[name="${stage}"]`);
      await checkbox.scrollIntoViewIfNeeded();
      if (!(await checkbox.isChecked())) {
        await checkbox.click(); // Use click() for checkboxes to be safer
      }
    }

    // Final Approval
    await page.click('button:has-text("Approve Event")');
    
    // Verify status change
    await page.waitForTimeout(1000); // Wait for processing
    await page.goto(`${BASE_URL}/admin/events/approved`);
    await expect(page.locator(`text=${eventName}`)).toBeVisible();
    
    console.log('Event handling workflow completed and verified as evidence.');
  });
});
