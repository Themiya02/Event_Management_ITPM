# ✅ Event Handling Test Setup Checklist

## Before Running Tests

### Step 1: Verify Test File Exists
- [ ] File exists: `frontend/tests/event-handling-complete.spec.js`
- [ ] File exists: `frontend/tests/EVENT_HANDLING_TEST_GUIDE.md`
- [ ] File exists: `frontend/tests/QUICK_TEST_COMMANDS.md`

### Step 2: Backend Setup
- [ ] Backend server running on correct port
  ```bash
  cd backend
  npm install
  npm start
  ```
- [ ] No port conflicts
- [ ] Database connection working
- [ ] Sample test accounts exist:
  - [ ] Organizer: `chaminda@gmail.com` / `123456`
  - [ ] Admin account available
  - [ ] User: `user@gmail.com` / `123456`

### Step 3: Frontend Setup
- [ ] Frontend running on `http://localhost:5173`
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- [ ] All dependencies installed
- [ ] No console errors on load
- [ ] Login page loads correctly

### Step 4: Database Check
- [ ] Create empty test event (ensure form works)
- [ ] Verify admin can approve events
- [ ] Verify user can register for events

### Step 5: Selector Validation

#### Event Creation Form Selectors
- [ ] `select#role` exists (role dropdown)
- [ ] `input[placeholder="Enter Email"]` exists
- [ ] `input[placeholder="Enter Password"]` exists
- [ ] `input[name="organizerName"]` exists
- [ ] `input[name="organizerEmail"]` exists
- [ ] `input[name="organizerPhone"]` exists
- [ ] `input[name="organizingBody"]` exists
- [ ] `input[name="eventTitle"]` exists
- [ ] `textarea[name="eventDescription"]` exists
- [ ] `input[name="eventDate"]` exists
- [ ] `input[name="eventTime"]` exists
- [ ] `input[name="venueType"]` exists
- [ ] `input[name="venueName"]` exists
- [ ] `input[name="seatLimit"]` exists
- [ ] `input[name="isRegistrationRequired"]` exists
- [ ] `input[name="ticketType"]` exists
- [ ] `button:has-text("Continue")` exists
- [ ] `button:has-text("Launch Event")` exists

**If selectors don't match:**
→ Update them in `event-handling-complete.spec.js` to match your HTML

#### Admin Approval Selectors
- [ ] `label.approval-stage-card` or equivalent exists
- [ ] Checkboxes for 4 approval stages exist
- [ ] `button:has-text("Approve")` exists
- [ ] Event detail page loads on click

#### User Registration Selectors
- [ ] Event cards/items display in list
- [ ] `button:has-text("Register")` exists on event detail
- [ ] Registration form fields exist:
  - [ ] `input[name="name"]` or similar
  - [ ] `input[name="email"]` or similar
  - [ ] `input[name="phone"]` or similar
- [ ] `button:has-text("Submit")` or similar exists

---

## Step 6: Test Routes Validation

Test these routes manually first:
- [ ] `http://localhost:5173/login` - Login page loads
- [ ] `http://localhost:5173/organizer/dashboard` - Organizer dashboard (after login)
- [ ] `http://localhost:5173/organizer/create-event` - Create event form
- [ ] `http://localhost:5173/organizer/events` - Events list
- [ ] `http://localhost:5173/organizer/track-event` - Event tracking
- [ ] `http://localhost:5173/admin/dashboard` - Admin dashboard
- [ ] `http://localhost:5173/admin/events/upcoming` - Upcoming events
- [ ] `http://localhost:5173/admin/events/approved` - Approved events
- [ ] `http://localhost:5173/user/dashboard` - User dashboard
- [ ] `http://localhost:5173/events` or `/home` - Event discovery page

**Note:** If routes are different, update BASE_URL + routes in test file

---

## Step 7: Playwright Installation Check
```bash
cd frontend
npm list @playwright/test
```
- [ ] Playwright is installed
- [ ] Version is recent (1.40+)

---

## Step 8: Run Single Test First

### Test the simplest test first:
```bash
npx playwright test tests/event-handling-complete.spec.js -g "1.1" --headed
```

**What to watch for:**
- [ ] Browser opens
- [ ] Login page loads
- [ ] Organizer login successful
- [ ] Event creation form loads
- [ ] Each field fills correctly
- [ ] Form submits successfully
- [ ] Redirected to track page

---

## Step 9: Selector Issues Resolution

If test fails on specific fields:

### Find the Correct Selector
1. Open application in browser
2. Right-click element → Inspect
3. Note the actual attributes:
   - Class names
   - ID
   - Name attribute
   - Placeholder text
   - aria-label

### Update Test Selectors

**Original in test:**
```javascript
await page.fill('input[name="eventTitle"]', eventTitle);
```

**If selector not found, try:**
```javascript
// Option 1: Use class name
await page.fill('input.event-title', eventTitle);

// Option 2: Use placeholder
await page.fill('input[placeholder="Event Title"]', eventTitle);

// Option 3: Use label text
await page.fill('//input[@aria-label="Event Title"]', eventTitle);

// Option 4: Find parent and nested input
const container = page.locator('.form-group:has-text("Event Title")');
await container.locator('input').fill(eventTitle);
```

---

## Step 10: Common Adjustments

### If Form Has Different Structure
- [ ] Check if form has multiple pages/sections
- [ ] Check if buttons have different text
- [ ] Check if submit button is in modal/drawer
- [ ] Update `Continue`, `Launch Event`, `Register` button selectors

### If Approval Has Different UI
- [ ] Check if approval uses checkboxes or buttons
- [ ] Check if approval is inline or modal
- [ ] Check class names for "approved" state
- [ ] Update stage count if not 4

### If URLs Are Different
Update `BASE_URL` and all navigation routes:
```javascript
const BASE_URL = 'http://localhost:YOUR_PORT';

// Update these:
await page.waitForURL(/organizer\/dashboard/, ...)
await page.goto(`${BASE_URL}/your-actual-path`)
```

---

## Step 11: Run Full Test Suite

Once single test passes:
```bash
npx playwright test tests/event-handling-complete.spec.js
```

**Expected output:**
```
✓ 1.1 | Organizer - Create Event...
✓ 1.2 | Organizer - Event Creation with Paid...
✓ 1.3 | Organizer - Validation: Missing...
... (20+ tests)
✓ 7.0 | Final Test Summary

20+ passed (4-5s)
```

---

## Step 12: Troubleshooting Guide

### Issue: "playwright not found"
```bash
npm install @playwright/test --save-dev
npx playwright install
```

### Issue: Tests timeout on first login
- **Cause**: Backend slow or database query slow
- **Fix**: Increase timeouts
  ```javascript
  test.setTimeout(300000); // 5 minutes
  ```

### Issue: "Element not found" on specific selectors
- **Cause**: Selectors don't match your HTML
- **Fix**: 
  1. Inspect element in browser
  2. Find correct selector
  3. Update in test file
  4. Re-run test

### Issue: "Navigation failed"
- **Cause**: Route doesn't exist or redirect happening
- **Fix**: Check URL and update routes in test

### Issue: Tests pass locally but fail in CI/CD
- **Cause**: Timing issues in CI environment
- **Fix**: Add explicit waits
  ```javascript
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  ```

---

## Step 13: Final Validation

### Run with Different Modes
- [ ] Headless mode (default):
  ```bash
  npx playwright test tests/event-handling-complete.spec.js
  ```
- [ ] Headed mode:
  ```bash
  npx playwright test tests/event-handling-complete.spec.js --headed
  ```
- [ ] UI mode:
  ```bash
  npx playwright test tests/event-handling-complete.spec.js --ui
  ```

### Generate and View Report
- [ ] Run tests with report:
  ```bash
  npx playwright test tests/event-handling-complete.spec.js
  npx playwright show-report
  ```
- [ ] Check all tests are passing
- [ ] Note any timing issues
- [ ] Check for any skipped tests

---

## Testing Checklist Summary

### Pre-Test Checklist
- [ ] Backend running and accessible
- [ ] Frontend running on localhost:5173
- [ ] Test accounts exist in database
- [ ] Database is clean/ready
- [ ] Playwright installed
- [ ] All selectors match your HTML

### After First Test Run
- [ ] No critical errors
- [ ] Selectors valid
- [ ] Navigation working
- [ ] Form submission working
- [ ] Database updates happening

### Before Using in CI/CD
- [ ] All tests pass locally
- [ ] Timing is consistent
- [ ] No flaky tests
- [ ] Report generation working

---

## When Ready for Production

1. ✅ All tests passing
2. ✅ No timeout issues
3. ✅ Selector mapping complete
4. ✅ CI/CD integration ready
5. ✅ Team trained on running tests

### Add to CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd backend && npm ci & npm start &
      - run: cd frontend && npm run dev &
      - run: npx playwright test tests/event-handling-complete.spec.js
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## Support

- 📖 See `EVENT_HANDLING_TEST_GUIDE.md` for detailed test documentation
- 🚀 See `QUICK_TEST_COMMANDS.md` for command reference
- 🐛 Enable debug: `DEBUG=pw:api npx playwright test ...`
- 📊 Check traces: `npx playwright show-trace trace.zip`

Good luck! 🎉
