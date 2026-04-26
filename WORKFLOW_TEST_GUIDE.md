# Event Management ITPM - Complete Workflow Test Guide

## 📋 Overview
This document provides comprehensive Playwright test scenarios for the Event Management ITPM system, covering the complete workflow from event creation to user registration and invitation display.

## 🎯 Workflow Scenarios

### Scenario 1: Organizer Creates Event
**Prerequisites:** Organizer account active and logged in

**Steps:**
1. Navigate to `/login`
2. Login with organizer credentials (chaminda@gmail.com / 123456)
3. Access organizer dashboard at `/organizer/dashboard`
4. Click "Create New Event"
5. **Step 1 - Organizer Information:**
   - Organizer Name: *Enter name*
   - Email: *Organizer email*
   - Phone: *10-digit number*
   - Organizing Body: *Club/Organization name*
   - Click "Next"

6. **Step 2 - Event Details:**
   - Event Title: *Event name*
   - Description: *Event description*
   - Date: *Future date*
   - Time: *Event time*
   - Click "Next"

7. **Step 3 - Venue & Ticketing:**
   - Venue Type: Select "Indoor"
   - Venue Name: *Location name*
   - Seat Limit: *Capacity number*
   - Registration Required: "Yes"
   - Ticket Type: "Free"
   - Click "Create Event"

**Expected Result:** Event created and sent for admin approval

---

### Scenario 2: Admin Reviews and Approves Event
**Prerequisites:** Event created and pending approval

**Steps:**
1. Navigate to `/admin`
2. Login with admin credentials (admin@gmail.com / 123456)
3. Access admin dashboard at `/admin/dashboard`
4. Click "Event Handling" → "Upcoming Events"
5. Find the created event in the pending list
6. Click "Review" button
7. Check all approval checkboxes (usually 4 stages):
   - Basic Information ✓
   - Content Review ✓
   - Safety & Compliance ✓
   - Final Approval ✓
8. Click "Permanently Publish Event"

**Expected Result:** Event status changes to "Published/Approved"

---

### Scenario 3: Organizer Tracks Approval Status
**Prerequisites:** Event submitted for approval

**Steps:**
1. Navigate to `/login`
2. Login as organizer
3. Go to `/organizer/dashboard`
4. Click "My Events"
5. Find created event and check status:
   - Status badge shows "Pending", "Approved", or "Published"
   - Click event to view detailed status

**Expected Result:** Event shows current approval status

---

### Scenario 4: User Views and Registers for Event with Payment
**Prerequisites:** Event is published/approved

**Steps:**
1. Navigate to `/login`
2. Login with user credentials (user@gmail.com / 123456)
3. Go to `/dashboard`
4. Find and click the approved event
5. Fill registration form:
   - Participant Name: *User name*
   - Campus ID: *ID number (e.g., IT21000000)*
   - Campus Year: *Select from dropdown*
6. Upload payment slip/receipt (image file)
7. Click "Register" or "Submit"

**Expected Result:** Registration submitted and awaiting organizer approval

---

### Scenario 5: Organizer Approves User Registration
**Prerequisites:** User submitted registration

**Steps:**
1. Navigate to `/login`
2. Login as organizer
3. Go to `/organizer/dashboard`
4. Click "Registration Hub"
5. Find user registration in table
6. View registration details and attached payment receipt
7. Click "Approve" button for the registration

**Expected Result:** User registration approved and status changes to "Approved"

---

### Scenario 6: User Views Invitation Card
**Prerequisites:** Registration approved by organizer

**Steps:**
1. Navigate to `/login`
2. Login as user
3. Go to `/user/tickets` or `/dashboard`
4. Find registered event
5. Click event to view details
6. Click "Show Invite" or "Display Invitation Card" button
7. Invitation card displays with:
   - Event name and date
   - User name
   - Registration QR code
   - Additional event details
8. Optional: Download or share invitation

**Expected Result:** Invitation card displayed successfully

---

## 🧪 Automated Tests

### Running Individual Tests

```bash
# Run complete workflow test
npx playwright test tests/event-workflow.spec.js

# Run specific scenario
npx playwright test tests/event-workflow.spec.js -g "Organizer Create Event"

# Run in headed mode (visible browser)
npx playwright test tests/event-workflow.spec.js --headed

# Run with single worker (sequential)
npx playwright test tests/event-workflow.spec.js --workers=1

# Generate HTML report
npx playwright show-report
```

### Test Structure

The tests are located in:
- `frontend/tests/event-workflow.spec.js` - Complete workflow scenarios
- `frontend/tests/playwright_evidence.spec.js` - Alternative test suite

### Prerequisites for Automated Tests

1. **Backend Server Running:**
   ```bash
   cd backend
   npm start
   # Server should be running on http://localhost:5002
   ```

2. **Frontend Dev Server Running:**
   ```bash
   cd frontend
   npm run dev
   # Server should be running on http://localhost:5173
   ```

3. **Database:** MongoDB must be running with test data

4. **Test Accounts Must Exist:**
   - Organizer: `chaminda@gmail.com` / `123456`
   - Admin: `admin@gmail.com` / `123456`
   - User: `user@gmail.com` / `123456`

---

## ✅ Checklist for Manual Testing

### Organizer Workflow
- [ ] Login successful
- [ ] Dashboard displays correctly
- [ ] Create Event button accessible
- [ ] Multi-step form displays all fields
- [ ] Event submission successful
- [ ] Event appears in My Events
- [ ] Status tracking working
- [ ] Registration Hub accessible
- [ ] Can view user registrations
- [ ] Can approve/reject registrations

### Admin Workflow
- [ ] Admin login successful
- [ ] Dashboard displays correctly
- [ ] Event Handling menu accessible
- [ ] Upcoming Events list shows pending events
- [ ] Review button opens event details
- [ ] All approval checkboxes clickable
- [ ] Publish button functional
- [ ] Event status updates correctly

### User Workflow
- [ ] User login successful
- [ ] Dashboard shows available events
- [ ] Can view event details
- [ ] Registration form displays all fields
- [ ] File upload works for payment receipt
- [ ] Registration submission successful
- [ ] My Tickets shows registered events
- [ ] Can view invitation card
- [ ] Invitation displays correct information

---

## 🔍 Troubleshooting

### Login Issues
- **Symptom:** Login button doesn't redirect
- **Solution:** Check backend server is running on port 5002
- **Check:** Run `curl http://localhost:5002` in terminal

### Event Not Appearing
- **Symptom:** Created event not visible in admin panel
- **Solution:** Admin may need to refresh or event still processing
- **Check:** Wait 2-3 seconds and refresh page

### Registration Form Errors
- **Symptom:** Campus ID field shows error
- **Solution:** Must be exactly 10 digits (e.g., IT21000000)
- **Check:** Verify Campus ID format

### File Upload Failing
- **Symptom:** Payment receipt upload not working
- **Solution:** Ensure file is valid image (PNG, JPG)
- **Check:** File size under 5MB

### Tests Failing
- **Symptom:** Playwright tests timeout or crash
- **Solution:** 
  1. Verify both frontend and backend servers running
  2. Clear browser cache: Run tests with `--no-cache`
  3. Check network connectivity
- **Logs:** View detailed logs in `test-results/` folder

---

## 📊 Test Results Interpretation

### Successful Test Output Example
```
Running 5 tests using 1 worker
✅ Scenario: Organizer Create Event
✅ Scenario: Admin Review and Approve Event
✅ Scenario: User Register for Event with Payment
✅ Scenario: Organizer Approve Registration & Show Invite
✅ Scenario: User View Invitation Card

5 passed (2m 34.5s)
```

### Failed Test Debugging
- Check `test-results/` directory for:
  - Screenshots of failed steps
  - Video recordings
  - Error context markdown files
- Look for specific error messages in console output
- Verify test account credentials exist in database

---

## 🎬 Test Scenarios Summary

| Scenario | Role | Action | Expected Result |
|----------|------|--------|-----------------|
| 1 | Organizer | Create Event | Event sent for approval |
| 2 | Admin | Review & Approve | Event becomes public |
| 3 | Organizer | Track Status | Status shows approved/published |
| 4 | User | Register + Payment | Registration awaits approval |
| 5 | Organizer | Approve Registration | User status changes to approved |
| 6 | User | View Invitation | Invitation card displays |

---

## 📝 Notes

- Event creation uses multi-step form validation
- Admin approval requires checking multiple approval stages
- Payment receipt must be image file (PNG, JPG recommended)
- Invitation card can be downloaded as PDF or shared via link
- All timestamps stored in ISO 8601 format
- Tests cleanup browser storage between scenarios

---

## 🚀 Getting Started

1. Ensure both servers running:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

2. Run tests:
   ```bash
   cd frontend
   npx playwright test tests/event-workflow.spec.js --headed
   ```

3. View results:
   ```bash
   npx playwright show-report
   ```

---

Generated: April 25, 2026
Test Suite Version: 1.0
