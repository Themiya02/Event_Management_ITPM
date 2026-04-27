# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: event-handling.spec.js >> Event Handling Workflow >> Complete Event Lifecycle: Creation to Approval
- Location: tests\event-handling.spec.js:10:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - link "Eventio" [ref=e6] [cursor=pointer]:
      - /url: /
    - generic [ref=e7]:
      - generic [ref=e8]:
        - link "Home" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "Events" [ref=e10] [cursor=pointer]:
          - /url: /organizer/events
        - link "Artists" [ref=e11] [cursor=pointer]:
          - /url: /organizer/artists
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
        - link "About" [ref=e13] [cursor=pointer]:
          - /url: /about
      - button "19" [ref=e15] [cursor=pointer]:
        - img [ref=e16]
        - generic [ref=e19]: "19"
      - generic [ref=e21] [cursor=pointer]:
        - generic [ref=e22]: 👤
        - generic [ref=e23]:
          - generic [ref=e24]: Chaminda Saman
          - generic [ref=e25]: organizer
        - generic [ref=e26]: ▾
  - main [ref=e27]:
    - generic [ref=e28]:
      - complementary [ref=e29]:
        - generic [ref=e30]:
          - img [ref=e32]
          - generic [ref=e34]:
            - generic [ref=e35]: Eventio
            - generic [ref=e36]: Organizer
        - navigation [ref=e37]:
          - list [ref=e38]:
            - listitem [ref=e39]:
              - link "Dashboard" [ref=e40] [cursor=pointer]:
                - /url: /organizer/dashboard
                - img [ref=e41]
                - generic [ref=e43]: Dashboard
            - listitem [ref=e44]:
              - link "Support Chat" [ref=e45] [cursor=pointer]:
                - /url: /organizer/messages
                - img [ref=e46]
                - generic [ref=e48]: Support Chat
            - listitem [ref=e49]
            - listitem [ref=e50]:
              - generic [ref=e51] [cursor=pointer]:
                - generic [ref=e52]:
                  - img [ref=e53]
                  - generic [ref=e55]: Event Management
                - img [ref=e56]
              - list [ref=e59]:
                - listitem [ref=e60]:
                  - link "Create New Event" [ref=e61] [cursor=pointer]:
                    - /url: /organizer/create-event
                - listitem [ref=e62]:
                  - link "Manage All Events" [ref=e63] [cursor=pointer]:
                    - /url: /organizer/events
                - listitem [ref=e64]:
                  - link "Track Performance" [ref=e65] [cursor=pointer]:
                    - /url: /organizer/track
            - listitem [ref=e66]:
              - generic [ref=e67] [cursor=pointer]:
                - generic [ref=e68]:
                  - img [ref=e69]
                  - generic [ref=e71]: Artist Relations
                - img [ref=e72]
              - list [ref=e74]:
                - listitem [ref=e75]:
                  - link "Browse Artists" [ref=e76] [cursor=pointer]:
                    - /url: /organizer/artists
                - listitem [ref=e77]:
                  - link "Ratings Analysis" [ref=e78] [cursor=pointer]:
                    - /url: /artists/analyze
            - listitem [ref=e79]:
              - generic [ref=e80] [cursor=pointer]:
                - generic [ref=e81]:
                  - img [ref=e82]
                  - generic [ref=e84]: Registration Hub
                - img [ref=e85]
              - list [ref=e87]:
                - listitem [ref=e88]:
                  - link "Review Registrations" [ref=e89] [cursor=pointer]:
                    - /url: /organizer/registrations
        - button "Log Out" [ref=e91] [cursor=pointer]:
          - img [ref=e92]
          - text: Log Out
      - main [ref=e95]:
        - generic [ref=e96]:
          - generic [ref=e97]:
            - heading "Create New Event" [level=1] [ref=e98]
            - paragraph [ref=e99]: Fill in the details below to launch your next big event.
          - generic [ref=e101]:
            - generic [ref=e102]:
              - generic [ref=e103]: ✓
              - generic [ref=e104]: Organizer
            - generic [ref=e106]:
              - generic [ref=e107]: ✓
              - generic [ref=e108]: Details
            - generic [ref=e110]:
              - generic [ref=e111]: "3"
              - generic [ref=e112]: Venue & Ticketing
          - generic [ref=e114]:
            - generic [ref=e115]:
              - 'heading "Step 3: Venue & Ticketing" [level=2] [ref=e116]'
              - paragraph [ref=e117]: Where is it happening, and how do attendees join?
              - generic [ref=e118]:
                - generic [ref=e119]: Campus Venue Type
                - generic [ref=e120]:
                  - generic [ref=e121] [cursor=pointer]:
                    - radio "🏛️Indoor" [checked]
                    - text: 🏛️Indoor
                  - generic [ref=e122] [cursor=pointer]:
                    - radio "🌳Outdoor"
                    - text: 🌳Outdoor
              - generic [ref=e123]:
                - generic [ref=e124]:
                  - generic [ref=e125]: Venue Name / Address
                  - textbox "e.g. Main Auditorium" [ref=e126]: Test Venue
                - generic [ref=e127]:
                  - generic [ref=e128]: Seat Limit / Capacity (Indoor)
                  - spinbutton [ref=e129]: "100"
              - separator [ref=e130]
              - generic [ref=e131]:
                - generic [ref=e132]: Registration Requirement
                - generic [ref=e133]:
                  - generic [ref=e134] [cursor=pointer]:
                    - radio "📝 Must Register Student Students MUST register for a ticket before they can attend the event." [checked]
                    - generic [ref=e135]:
                      - generic [ref=e136]: 📝 Must Register Student
                      - generic [ref=e137]: Students MUST register for a ticket before they can attend the event.
                  - generic [ref=e138] [cursor=pointer]:
                    - radio "🚪 Open Event (Walk-in) Open to everyone! Anyone can just walk into the venue without registering."
                    - generic [ref=e139]:
                      - generic [ref=e140]: 🚪 Open Event (Walk-in)
                      - generic [ref=e141]: Open to everyone! Anyone can just walk into the venue without registering.
              - generic [ref=e142]:
                - generic [ref=e143]: Ticket Price Category
                - generic [ref=e144]:
                  - generic [ref=e145] [cursor=pointer]:
                    - radio "🎟️Free Ticket" [checked]
                    - text: 🎟️Free Ticket
                  - generic [ref=e146] [cursor=pointer]:
                    - radio "💳Paid Ticket"
                    - text: 💳Paid Ticket
            - generic [ref=e147]:
              - button "Back" [ref=e148] [cursor=pointer]
              - button "Launch Event 🚀" [active] [ref=e150] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Test Configuration
  4  | const BASE_URL = 'http://localhost:5173';
  5  | const ORGANIZER_CREDENTIALS = { email: 'chaminda@gmail.com', password: '123456' };
  6  | const ADMIN_CREDENTIALS = { email: 'admin@gmail.com', password: '123456' };
  7  | 
  8  | test.describe('Event Handling Workflow', () => {
  9  |   
  10 |   test('Complete Event Lifecycle: Creation to Approval', async ({ page }) => {
  11 |     // 1. Login as Organizer
  12 |     await page.goto(`${BASE_URL}/login`);
  13 |     await page.fill('input[type="email"]', ORGANIZER_CREDENTIALS.email);
  14 |     await page.fill('input[type="password"]', ORGANIZER_CREDENTIALS.password);
  15 |     await page.click('button[type="submit"]');
  16 |     
  17 |     // Verify Organizer Dashboard
  18 |     await expect(page).toHaveURL(/.*organizer\/dashboard/);
  19 |     console.log('Successfully logged in as Organizer');
  20 | 
  21 |     // 2. Create a New Event (Stepper Form)
  22 |     await page.goto(`${BASE_URL}/organizer/create-event`);
  23 |     const eventName = `Test Event ${Date.now()}`;
  24 | 
  25 |     // Step 1: Organizer Details
  26 |     await page.fill('input[name="organizerName"]', 'Test Organizer');
  27 |     await page.fill('input[name="organizingBody"]', 'Test Club');
  28 |     await page.fill('input[name="organizerEmail"]', 'test@example.com');
  29 |     await page.fill('input[name="organizerPhone"]', '0711234567');
  30 |     await page.click('button:has-text("Continue")');
  31 | 
  32 |     // Step 2: Event Information
  33 |     await page.fill('input[name="eventTitle"]', eventName);
  34 |     await page.fill('input[name="artistName"]', 'Test Artist');
  35 |     await page.fill('textarea[name="eventDescription"]', 'This is a test event created by Playwright');
  36 |     await page.fill('input[name="eventDate"]', '2026-12-31');
  37 |     await page.fill('input[name="eventTime"]', '18:00');
  38 |     await page.click('button:has-text("Continue")');
  39 | 
  40 |     // Step 3: Venue & Ticketing
  41 |     await page.fill('input[name="venueName"]', 'Test Venue');
  42 |     await page.fill('input[name="seatLimit"]', '100');
  43 |     
  44 |     // Submit Event
  45 |     await page.click('button.btn-submit');
  46 |     
  47 |     // Verify redirection to tracking page
> 48 |     await page.waitForURL(/.*organizer\/track/);
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  49 |     console.log(`Event "${eventName}" created and pending review`);
  50 | 
  51 |     // 3. Logout
  52 |     await page.goto(`${BASE_URL}/login`); 
  53 | 
  54 |     // 4. Login as Admin
  55 |     await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
  56 |     await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
  57 |     await page.click('button[type="submit"]');
  58 |     await expect(page).toHaveURL(/.*admin\/dashboard/);
  59 |     console.log('Successfully logged in as Admin');
  60 | 
  61 |     // 5. Navigate to Event Review
  62 |     await page.goto(`${BASE_URL}/admin/events/upcoming`);
  63 |     
  64 |     // Find the newly created event in the list (using card selector)
  65 |     const eventCard = page.locator(`.event-card:has-text("${eventName}")`);
  66 |     await expect(eventCard).toBeVisible();
  67 |     await eventCard.locator('button:has-text("Review Event Details")').click();
  68 | 
  69 |     // 6. Approve through all 4 stages
  70 |     const stages = ['security', 'medical', 'community', 'dean'];
  71 |     for (const stage of stages) {
  72 |       const checkbox = page.locator(`input[name="${stage}"]`);
  73 |       await checkbox.scrollIntoViewIfNeeded();
  74 |       if (!(await checkbox.isChecked())) {
  75 |         await checkbox.click(); // Use click() for checkboxes to be safer
  76 |       }
  77 |     }
  78 | 
  79 |     // Final Approval
  80 |     await page.click('button:has-text("Approve Event")');
  81 |     
  82 |     // Verify status change
  83 |     await page.waitForTimeout(1000); // Wait for processing
  84 |     await page.goto(`${BASE_URL}/admin/events/approved`);
  85 |     await expect(page.locator(`text=${eventName}`)).toBeVisible();
  86 |     
  87 |     console.log('Event handling workflow completed and verified as evidence.');
  88 |   });
  89 | });
  90 | 
```