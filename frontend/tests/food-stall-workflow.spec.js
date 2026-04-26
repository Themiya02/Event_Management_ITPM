import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

test.describe.serial('Food Stall Management Workflow', () => {
  test.setTimeout(180000);
  
  let stallLoc = 'T' + Date.now().toString().slice(-3);
  let stallName = `Gourmet Hub ${Date.now()}`;
  
  // Create a dummy image for uploads in the current directory
  const dummyImagePath = path.resolve('tests/dummy-map.png');
  if (!fs.existsSync(dummyImagePath)) {
    fs.writeFileSync(dummyImagePath, 'dummy content');
  }

  test('1. Admin: Create Event & Add Food Stall Map', async ({ page }) => {
    console.log(`\n▶️ Step 1: Admin adding stall map for stall: ${stallLoc}`);
    
    // Login as Admin
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'admin');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForURL(/admin\/dashboard/);

    await page.goto(`${BASE_URL}/admin/food/upload-map`);
    await page.waitForLoadState('networkidle');
    
    const eventCards = page.locator('.event-card');
    if (await eventCards.count() === 0) {
      console.log('⚠️ No events found to upload map. Please ensure an event exists.');
      return;
    }

    const firstEvent = eventCards.first();
    const eventName = await firstEvent.locator('h3').innerText();
    console.log(`Using event: ${eventName}`);

    // Open Upload Modal
    await firstEvent.locator('button:has-text("Upload Blueprint Map"), button:has-text("Update Blueprint Map")').click();
    
    // Add a new row if existing ones are there, or just use the first empty one
    await page.waitForSelector('.stall-map-modal-cell-input');
    await page.click('button:has-text("+ Add row")');
    
    const stallInputs = page.locator('.stall-map-modal-cell-input[placeholder="e.g. A1"]');
    const lastStallInput = stallInputs.last();
    await lastStallInput.fill(stallLoc);
    
    const priceInputs = page.locator('input[type="number"][placeholder="0"]');
    const lastPriceInput = priceInputs.last();
    await lastPriceInput.fill('5000');

    // Upload Map
    await page.setInputFiles('input[type="file"]', dummyImagePath);

    // Save
    await page.click('button:has-text("Save changes")');
    
    // Check for success sweetalert
    await expect(page.getByRole('heading', { name: 'Saved' }).first()).toBeVisible({ timeout: 30000 });
    await page.click('button:has-text("OK")');
    console.log('✅ Admin map added successfully');
  });

  test('2. Food Stall Member: Submit Booking Form', async ({ page }) => {
    console.log(`\n▶️ Step 2: Food Stall Member submitting booking for stall: ${stallLoc}`);
    
    const testEmail = `vendor_${Date.now()}@test.com`;
    
    await page.goto(`${BASE_URL}/register`);
    await page.selectOption('select#role', 'food_stall');
    await page.fill('#name', 'Test Vendor');
    await page.fill('#email', testEmail);
    await page.fill('#phone', '0712345678');
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/food\/dashboard/);
    console.log('✅ Food Stall Member registered and logged in');

    // Go to events and book
    await page.click('.tab-btn:has-text("Events")');
    const eventCard = page.locator('.event-card').first();
    await eventCard.click();

    // Fill Booking Form
    await page.waitForSelector('select');
    // Find the option that contains our unique stall location
    const optionData = await page.evaluate((loc) => {
      const select = document.querySelector('select');
      const options = Array.from(select.options);
      const texts = options.map(o => o.text);
      const target = options.find(opt => opt.text.includes(loc));
      return { 
        texts, 
        targetValue: target ? target.value : null 
      };
    }, stallLoc);
    
    console.log('Available options:', optionData.texts);
    
    if (optionData.targetValue) {
      await page.selectOption('select', optionData.targetValue);
    } else {
      console.log(`⚠️ Could not find option for stall: ${stallLoc}. Selecting first available.`);
      await page.selectOption('select', { index: 1 });
    }
    await page.fill('input[placeholder="e.g. Tasty Treats"]', stallName);
    
    // Select food type
    const foodTypeSelect = page.locator('select').nth(1);
    await foodTypeSelect.selectOption('Fast Food').catch(() => {});
    
    await page.fill('textarea[placeholder*="describe"]', 'Delicious snacks for everyone');
    
    await page.check('input[type="checkbox"] >> nth=0'); // Electricity
    
    // Upload Payment Slip
    await page.setInputFiles('input[type="file"]', dummyImagePath);
    
    // Submit
    const submitBtn = page.locator('button:has-text("Submit Application")');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();
    
    // Verify Success
    await page.waitForSelector('.swal2-popup', { timeout: 30000 });
    await expect(page.locator('.swal2-title')).toHaveText(/Success/i);
    await page.click('button.swal2-confirm');
    console.log('✅ Food stall booking member successful submit booking form');
  });

  test('3. Admin: Verify Booking Status and Accept/Reject', async ({ page }) => {
    console.log('\n▶️ Step 3: Admin verifying and approving booking');
    
    await page.goto(`${BASE_URL}/login`);
    await page.selectOption('select#role', 'admin');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForURL(/admin\/dashboard/);

    await page.goto(`${BASE_URL}/admin/food/bookings`);
    await page.waitForLoadState('networkidle');

    // Select the event
    const eventCard = page.locator('.event-card').first();
    await eventCard.click();

    // Find the vendor row
    const vendorRow = page.locator('.food-stall-bookings-vendor-row').filter({ hasText: stallName });
    await expect(vendorRow).toBeVisible({ timeout: 10000 });

    // Check status is Pending
    const statusPill = vendorRow.locator('.food-stall-bookings-status');
    await expect(statusPill).toHaveText(/Pending/i);
    console.log('✅ Check Booking Submission sets status to "Pending"');

    // Approve
    page.on('dialog', dialog => dialog.accept());
    await vendorRow.locator('button:has-text("Approve")').click();
    
    // Verify Status Update
    await expect(statusPill).toHaveText(/Approved/i);
    console.log('✅ Test Admin Accept/Reject updates user booking status correctly');
  });
});
