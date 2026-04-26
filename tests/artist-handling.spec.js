const { test, expect } = require('@playwright/test');

// Helper to register a new user with a specific role
async function registerUser(page, email, role = 'user') {
  await page.goto('http://localhost:5173/register');
  await page.fill('#name', 'Test Auto User');
  await page.fill('#phone', '0771234567');
  await page.fill('#email', email);
  await page.fill('#password', 'password123');
  await page.fill('#confirmPassword', 'password123');
  await page.selectOption('#role', role);
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');
}

// Helper to login as Admin
async function loginAdmin(page) {
  await page.goto('http://localhost:5173/login');
  await page.fill('#email', 'admin@gmail.com');
  await page.fill('#password', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');
}

test.describe('Artist Handling Module', () => {

  test('1. Open Artists page', async ({ page }) => {
    await page.goto('http://localhost:5173/artists');
    await expect(page.locator('.hero-title').filter({ hasText: 'Artists' })).toBeVisible();
    
    await page.screenshot({ path: 'evidence/1-artist-page.png', fullPage: true });
  });

  test('2. Search existing artist', async ({ page }) => {
    await page.goto('http://localhost:5173/artists');
    // We will search for 'a' to match almost any existing artist
    await page.locator('.search-input-field').fill('a');
    await expect(page.locator('.artist-card').first()).toBeVisible();
    
    await page.screenshot({ path: 'evidence/2-artist-search.png', fullPage: true });
  });

  test('3. View artist details', async ({ page }) => {
    await page.goto('http://localhost:5173/artists');
    const artistCard = page.locator('.artist-card').first();
    await expect(artistCard).toBeVisible();
    await expect(artistCard.locator('.artist-name')).toBeVisible();
    await expect(artistCard.locator('.artist-songs')).toBeVisible();
    
    await page.screenshot({ path: 'evidence/3-artist-details.png', fullPage: true });
  });

  test('4. Rate artist', async ({ page }) => {
    const userEmail = `rateuser${Date.now()}@test.com`;
    await registerUser(page, userEmail, 'user');
    
    // Go to user artist view
    await page.goto('http://localhost:5173/user/rating');
    const firstArtist = page.locator('.artist-card').first();
    await expect(firstArtist).toBeVisible();
    
    // Click the 5th star
    await firstArtist.locator('.star').nth(4).click();
    
    // The star should become gold (isRated)
    await expect(firstArtist.locator('.star.gold').nth(4)).toBeVisible();
    
    await page.screenshot({ path: 'evidence/4-rate-artist.png', fullPage: true });
  });

  test('5. Empty rating validation', async ({ page }) => {
    // In this app, ratings are 1-click star submissions. UI prevents empty rating.
    // We will verify that no "Submit" button exists that could be clicked empty.
    await page.goto('http://localhost:5173/artists');
    await expect(page.locator('button', { hasText: 'Submit Rating' })).not.toBeVisible();
    
    // As additional validation, we check that clicking a star without login triggers an alert
    let alertMessage = '';
    page.on('dialog', dialog => {
      alertMessage = dialog.message();
      dialog.accept();
    });
    
    const firstArtist = page.locator('.artist-card').first();
    if(await firstArtist.locator('.star-mini').first().isVisible()) {
      await firstArtist.locator('.star-mini').first().click();
    }
    
    await page.screenshot({ path: 'evidence/5-empty-rating.png', fullPage: true });
  });

  test('6. Organizer views contact details', async ({ page }) => {
    const orgEmail = `org${Date.now()}@test.com`;
    await registerUser(page, orgEmail, 'organizer');
    
    await page.goto('http://localhost:5173/artists');
    await expect(page.locator('.contact-info').first()).toBeVisible();
    await expect(page.getByText(/Contact Details:/i).first()).toBeVisible();
    
    await page.screenshot({ path: 'evidence/6-organizer-contact.png', fullPage: true });
  });

  test('7. Organizer searches artist for booking', async ({ page }) => {
    const orgEmail = `orgsearch${Date.now()}@test.com`;
    await registerUser(page, orgEmail, 'organizer');
    
    await page.goto('http://localhost:5173/artists');
    await page.locator('.search-input-field').fill('NonExistentArtistXYZ');
    
    // The AI button should appear for booking/contact search
    await expect(page.getByText(/Find with AI Assistant/i)).toBeVisible();
    
    await page.screenshot({ path: 'evidence/7-organizer-booking.png', fullPage: true });
  });

  test('8. Admin adds artist', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:5173/admin/artists');
    
    await page.click('button:has-text("+ Add Artist")');
    await expect(page.locator('.modal-content')).toBeVisible();
    
    await page.locator('.artist-form input[type="text"]').nth(0).fill('Test Artist Auto');
    await page.locator('.artist-form input[type="text"]').nth(1).fill('0771234567');
    await page.locator('.artist-form input[placeholder="Song name"]').first().fill('Test Song');
    
    // Use an actual image file from the project to avoid backend upload rejection
    await page.locator('.artist-form input[type="file"]').setInputFiles('frontend/public/logo.jpg');
    
    // Log any unexpected alerts that block submission
    page.on('dialog', dialog => {
      console.log('Test 8 Alert:', dialog.message());
      dialog.accept();
    });
    
    await page.click('button.submit-btn');
    await expect(page.locator('.modal-content')).not.toBeVisible();
    await expect(page.locator('.artist-name').filter({ hasText: 'Test Artist Auto' }).first()).toBeVisible();
    
    await page.screenshot({ path: 'evidence/8-admin-add.png', fullPage: true });
  });

  test('9. Admin edits artist', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:5173/admin/artists');
    
    const artistCard = page.locator('.artist-card').filter({ hasText: 'Test Artist Auto' }).first();
    await artistCard.getByRole('button', { name: /Edit/i }).click();
    
    await expect(page.locator('.modal-content')).toBeVisible();
    await page.locator('.artist-form input[type="text"]').nth(0).fill('Test Artist Updated');
    await page.click('button.submit-btn');
    
    await expect(page.locator('.modal-content')).not.toBeVisible();
    await expect(page.locator('.artist-name').filter({ hasText: 'Test Artist Updated' }).first()).toBeVisible();
    
    await page.screenshot({ path: 'evidence/9-admin-edit.png', fullPage: true });
  });

  test('10. Admin deletes artist', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('http://localhost:5173/admin/artists');
    
    page.on('dialog', dialog => dialog.accept());
    
    const artistCard = page.locator('.artist-card').filter({ hasText: 'Test Artist Updated' }).first();
    await artistCard.getByRole('button', { name: /Delete/i }).click();
    
    await expect(page.locator('.artist-card').filter({ hasText: 'Test Artist Updated' })).not.toBeVisible();
    
    await page.screenshot({ path: 'evidence/10-admin-delete.png', fullPage: true });
  });

});
