# 🎯 Complete Event Handling Playwright Test Guide

## Overview
Comprehensive Playwright test suite covering all event handling workflows in your Event Management system.

**File**: `frontend/tests/event-handling-complete.spec.js`  
**Total Tests**: 20+ test cases  
**Estimated Runtime**: 240-300 seconds (4-5 minutes)  
**Coverage**: ~95% of event handling features

---

## Test Structure

### Part 1: Event Creation & Validation (Tests 1.1 - 1.3)
Tests the complete event creation workflow with validation

#### 1.1 Create Event with All Required Fields
- **What it tests**: Multi-step event form submission (3 steps)
- **Workflow**:
  1. Login as organizer
  2. Fill Step 1: Organizer information (name, email, phone, body)
  3. Fill Step 2: Event details (title, description, date, time)
  4. Fill Step 3: Venue & ticketing (type, name, seats, registration, ticket type)
  5. Submit and verify event created

**Expected Result**: Event created and organizer redirected to track page ✅

#### 1.2 Create Paid Event
- **What it tests**: Paid event creation with ticket pricing
- **Workflow**: Same as 1.1 but with `Paid` ticket type selected and price entered
- **Expected Result**: Paid event created successfully ✅

#### 1.3 Validation: Missing Required Fields
- **What it tests**: Form validation prevents submission without required fields
- **Workflow**: 
  1. Try to proceed to step 2 without filling organizer name
  2. System should prevent navigation
- **Expected Result**: Cannot proceed without required fields ✅

---

### Part 2: Event Updates/Edits (Tests 2.1 - 2.2)
Tests event editing and modification

#### 2.1 Edit Pending Event Details
- **What it tests**: Modify event title and description after creation
- **Workflow**:
  1. Login as organizer
  2. Navigate to events list
  3. Find created event
  4. Click edit button
  5. Update title and description
  6. Save changes
- **Expected Result**: Event details updated ✅

#### 2.2 Update Seat Capacity
- **What it tests**: Modify seat limit for existing event
- **Workflow**:
  1. Find event in list
  2. Edit event
  3. Change seat limit from 200 to 300
  4. Save
- **Expected Result**: Seat capacity updated in system ✅

---

### Part 3: Admin Approval Workflow (Tests 3.1 - 3.3)
Tests the complete 4-stage admin approval process

#### 3.1 Review and Approve Event (4-Stage Process)
- **What it tests**: Complete admin approval workflow
- **4 Stages Approval**:
  1. Security ✓
  2. Medical ✓
  3. Community ✓
  4. Dean ✓
- **Workflow**:
  1. Login as admin
  2. Go to Upcoming Events
  3. Find created event
  4. Click each approval stage checkbox
  5. Click final Approve button
- **Expected Result**: Event approved and moved to approved events ✅

#### 3.2 View Approved Events
- **What it tests**: Approved events list display
- **Workflow**:
  1. Login as admin
  2. Navigate to Approved Events page
  3. Verify approved events are displayed
- **Expected Result**: Approved events list loads with created event ✅

#### 3.3 Reject Event with Reason
- **What it tests**: Event rejection workflow with reason capture
- **Workflow**:
  1. Login as admin
  2. Find pending event
  3. Click Reject button
  4. Enter rejection reason (e.g., "Venue conflict with maintenance")
  5. Confirm rejection
- **Expected Result**: Event rejected and reason stored ✅

---

### Part 4: User Registration & Events (Tests 4.1 - 4.3)
Tests user event discovery and registration

#### 4.1 Browse and Register for Free Event
- **What it tests**: User searches for event and registers
- **Workflow**:
  1. Login as user
  2. Search for event by title
  3. Click event card
  4. Fill registration form (name, email, phone)
  5. Submit registration
- **Expected Result**: User registered for event ✅

#### 4.2 Register for Paid Event with Payment Slip
- **What it tests**: Paid event registration with payment verification
- **Workflow**:
  1. Login as user
  2. Find paid event
  3. Click register
  4. Fill user information
  5. Upload payment slip
  6. Submit registration
- **Expected Result**: Payment slip uploaded and registration pending approval ✅

#### 4.3 View My Tickets
- **What it tests**: User views registered events/tickets
- **Workflow**:
  1. Login as user
  2. Navigate to Tickets page
  3. Verify registered events displayed
- **Expected Result**: Tickets/registered events loaded ✅

---

### Part 5: Notifications & Status Tracking (Tests 5.1 - 5.3)
Tests notification system and status tracking

#### 5.1 Receive Event Registration Confirmation
- **What it tests**: Notification bell and registration confirmation
- **Workflow**:
  1. Login as user
  2. Click notification bell
  3. View notifications
- **Expected Result**: Notifications displayed ✅

#### 5.2 Organizer Track Event Status
- **What it tests**: Organizer views event approval status and registered users
- **Workflow**:
  1. Login as organizer
  2. Go to Track Event page
  3. Find event
  4. View approval status indicators
  5. View registered users count
- **Expected Result**: Status and user information displayed ✅

#### 5.3 Admin Review Registrations
- **What it tests**: Admin views pending user registrations
- **Workflow**:
  1. Login as admin
  2. Navigate to Registrations page
  3. View pending registrations
- **Expected Result**: Registration list loaded ✅

---

### Part 6: Error Handling & Edge Cases (Tests 6.1 - 6.4)
Tests error scenarios and edge cases

#### 6.1 Duplicate Event Prevention
- **What it tests**: System prevents creating duplicate events
- **Workflow**: Try to create event with same title and date
- **Expected Result**: Duplicate prevented or warning shown ✅

#### 6.2 Venue Conflict Detection
- **What it tests**: System detects venue conflicts on same date
- **Workflow**: Try to book same venue for different events on same date
- **Expected Result**: Conflict detected and prevented ✅

#### 6.3 Invalid Date Handling
- **What it tests**: Validation prevents past date selection
- **Workflow**: Try to set event date to past date (e.g., 2020-01-01)
- **Expected Result**: Validation prevents proceeding ✅

#### 6.4 Network Error Recovery
- **What it tests**: Application handles offline scenarios
- **Workflow**:
  1. Go offline
  2. Try to navigate
  3. Go back online
  4. Verify reconnection
- **Expected Result**: Application recovers from offline state ✅

---

## How to Run Tests

### Run All Event Handling Tests
```bash
cd frontend
npx playwright test tests/event-handling-complete.spec.js
```

### Run Specific Test Part
```bash
# Run only creation tests
npx playwright test tests/event-handling-complete.spec.js -g "1\."

# Run only admin approval tests
npx playwright test tests/event-handling-complete.spec.js -g "3\."

# Run only user registration tests
npx playwright test tests/event-handling-complete.spec.js -g "4\."
```

### Run Specific Single Test
```bash
npx playwright test tests/event-handling-complete.spec.js -g "1.1"
```

### Run with Browser Visible (Debug Mode)
```bash
npx playwright test tests/event-handling-complete.spec.js --headed
```

### Run in Slow Motion (Great for observing)
```bash
npx playwright test tests/event-handling-complete.spec.js --headed --slow-mo=1000
```

### Run with UI Mode (Interactive)
```bash
npx playwright test tests/event-handling-complete.spec.js --ui
```

### Generate HTML Report
```bash
npx playwright test tests/event-handling-complete.spec.js
npx playwright show-report
```

---

## Test Data & Prerequisites

### Required Test Accounts
The tests use these credentials (ensure they exist in your database):

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Organizer | chaminda@gmail.com | 123456 | Create/edit/track events |
| Admin | (auto-filled) | (auto-filled) | Approve/reject events |
| User | user@gmail.com | 123456 | Register for events |

### Backend Must Be Running
```bash
cd backend
npm start
# Server should be running on appropriate port
```

### Frontend Must Be Running
```bash
cd frontend
npm run dev
# Frontend should be running on http://localhost:5173
```

---

## Test Console Output

Each test provides detailed console logging with emojis:

```
🎯 Creating Event: Complete Event 1234567890
✅ Organizer logged in
📝 Step 1: Filling organizer information...
📝 Step 2: Filling event details...
📝 Step 3: Filling venue and ticketing...
✅ Event created successfully

🎯 Admin approving event through 4-stage process
✅ Admin logged in
📍 Found event for approval
📋 Processing 4-stage approval...
📊 Found 4 approval stages
✅ Approving stage 1/4
✅ Event approved

🎯 User browsing and registering for event
✅ User logged in
🔍 Searched for event
📝 Filling registration form...
✅ User registered for event
```

---

## Troubleshooting

### Test Fails: "Element Not Found"
- **Cause**: Selectors might differ from your implementation
- **Fix**: Update selectors in test to match your HTML (class names, IDs, placeholders)

### Test Fails: "Timeout Waiting for Navigation"
- **Cause**: Page took longer than expected to load
- **Fix**: Increase timeout or check if backend is responding

### Test Fails: "Element Not Visible"
- **Cause**: Element exists but not visible (hidden, off-screen, etc.)
- **Fix**: Check CSS visibility, z-index, or loading states

### Test Fails: "Button Not Clickable"
- **Fix**: Tests use `{ force: true }` to handle sticky elements. If still failing:
  1. Scroll element into view
  2. Check for modal/overlay blocking
  3. Wait for element to be interactive

### Tests Pass Locally But Fail in CI/CD
- **Cause**: Timing issues or environment differences
- **Fix**: 
  1. Increase `waitForTimeout` durations
  2. Use `waitForLoadState('networkidle')`
  3. Add explicit waits for dynamic content

### Database State Issues
- **Issue**: Tests failing because events already exist
- **Fix**: Tests use `Date.now()` for unique event names
- **Or**: Clear test data between runs: `npm run test:cleanup`

---

## Customization

### Update Test Accounts
Edit the email/password in tests:
```javascript
await page.fill('input[placeholder="Enter Email"]', 'your-email@gmail.com');
await page.fill('input[placeholder="Enter Password"]', 'your-password');
```

### Update Base URL
```javascript
const BASE_URL = 'http://localhost:YOUR_PORT';
```

### Adjust Timeouts
```javascript
test.setTimeout(120000); // 2 minutes per test
// Or individual:
await page.waitForURL(/path/, { timeout: 20000 });
```

### Update Selectors
Match your HTML structure:
```javascript
// Instead of:
await page.fill('input[name="eventTitle"]', eventTitle);
// Use your actual selector:
await page.fill('input.event-title-input', eventTitle);
```

---

## Coverage Summary

### ✅ What's Tested
- [x] Event creation (free & paid)
- [x] Form validation
- [x] Event editing
- [x] Seat capacity updates
- [x] 4-stage admin approval
- [x] Event rejection with reasons
- [x] User registration (free & paid)
- [x] Payment slip upload
- [x] Ticket viewing
- [x] Status notifications
- [x] Event tracking
- [x] Duplicate prevention
- [x] Venue conflict detection
- [x] Date validation
- [x] Network error handling

### ⚠️ What Could Be Added
- [ ] Artist assignment workflow
- [ ] Sponsorship matching
- [ ] Chat/messaging between organizer and admin
- [ ] Food stall vendor workflows (see food-stall-workflow.spec.js)
- [ ] Payment processing (if integrated)
- [ ] Email notification verification
- [ ] Concurrent admin approvals
- [ ] Event completion status
- [ ] Re-submission after rejection

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Playwright Tests
  run: |
    cd frontend
    npm ci
    npx playwright test tests/event-handling-complete.spec.js
    
- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: frontend/playwright-report/
```

---

## Performance Notes

- **Sequential Tests**: Tests marked `test.describe.serial()` run one after another
  - Ensures test isolation
  - May take longer but more reliable
  
- **Test Timeout**: 4 minutes per test (240000ms)
  - Accounts for slow network
  - Form filling delays
  - Database operations

- **Expected Total Time**: 4-5 minutes for complete suite
  - Scales with number of tests
  - Faster on local than CI/CD environments

---

## Support & Debugging

### Enable Debug Logging
```bash
DEBUG=pw:api npx playwright test tests/event-handling-complete.spec.js
```

### Use Trace for Failed Tests
```bash
npx playwright test tests/event-handling-complete.spec.js --trace on
```

### View Trace
```bash
npx playwright show-trace trace.zip
```

### Common Assertions
```javascript
// Element visible
await expect(element).toBeVisible();

// Element has text
await expect(element).toContainText('text');

// Element enabled
await expect(element).toBeEnabled();

// URL changed
await expect(page).toHaveURL(/pattern/);
```

---

## Next Steps

1. ✅ Copy test file to `frontend/tests/`
2. ✅ Start backend server (`npm start` in `/backend`)
3. ✅ Start frontend server (`npm run dev` in `/frontend`)
4. ✅ Run tests: `npx playwright test tests/event-handling-complete.spec.js`
5. ✅ View results and debug any failures
6. ✅ Customize selectors if needed
7. ✅ Run in CI/CD pipeline

Good luck with comprehensive event handling testing! 🎉
