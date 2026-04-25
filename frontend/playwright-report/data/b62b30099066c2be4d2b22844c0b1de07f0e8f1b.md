# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comprehensive-e2e.spec.js >> Master Event Lifecycle & Features E2E >> Step 3: Admin - Search, Review, Chat Reply & Approve
- Location: tests\comprehensive-e2e.spec.js:119:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:5173/admin/events/upcoming"
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
          - /url: /admin/events/upcoming
        - link "Artists" [ref=e11] [cursor=pointer]:
          - /url: /admin/artists/view
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
        - link "About" [ref=e13] [cursor=pointer]:
          - /url: /about
        - link "Dashboard" [ref=e14] [cursor=pointer]:
          - /url: /admin/dashboard
      - button "32" [ref=e16] [cursor=pointer]:
        - img [ref=e17]
        - generic [ref=e20]: "32"
      - generic [ref=e22] [cursor=pointer]:
        - generic [ref=e23]: 👤
        - generic [ref=e24]:
          - generic [ref=e25]: admin
          - generic [ref=e26]: admin
        - generic [ref=e27]: ▾
  - main [ref=e28]:
    - generic [ref=e29]:
      - complementary [ref=e30]:
        - generic [ref=e31]:
          - img [ref=e33]
          - generic [ref=e36]:
            - generic [ref=e37]: Eventio
            - generic [ref=e38]: Admin Panel
        - navigation [ref=e39]:
          - list [ref=e40]:
            - listitem [ref=e41]:
              - link "Dashboard" [ref=e42] [cursor=pointer]:
                - /url: /admin/dashboard
                - img [ref=e43]
                - generic [ref=e47]: Dashboard
            - listitem [ref=e48]:
              - link "Inbox" [ref=e49] [cursor=pointer]:
                - /url: /admin/messages
                - img [ref=e50]
                - generic [ref=e53]: Inbox
            - listitem [ref=e54]:
              - generic [ref=e55] [cursor=pointer]:
                - generic [ref=e56]:
                  - img [ref=e57]
                  - generic [ref=e61]: Event Handling
                - img [ref=e62]
              - list [ref=e65]:
                - listitem [ref=e66]:
                  - link "Upcoming Events" [ref=e67] [cursor=pointer]:
                    - /url: /admin/events/upcoming
                - listitem [ref=e68]:
                  - link "Approved Events" [ref=e69] [cursor=pointer]:
                    - /url: /admin/events/approved
                - listitem [ref=e70]:
                  - link "Rejected Events" [ref=e71] [cursor=pointer]:
                    - /url: /admin/events/rejected
            - listitem [ref=e72]:
              - generic [ref=e73] [cursor=pointer]:
                - generic [ref=e74]:
                  - img [ref=e75]
                  - generic [ref=e79]: Sponsor Handling
                - img [ref=e80]
              - list [ref=e82]:
                - listitem [ref=e83]:
                  - link "Manage Sponsorships" [ref=e84] [cursor=pointer]:
                    - /url: /admin/sponsorships
            - listitem [ref=e85]:
              - generic [ref=e86] [cursor=pointer]:
                - generic [ref=e87]:
                  - img [ref=e88]
                  - generic [ref=e93]: Food Stall Handling
                - img [ref=e94]
              - list [ref=e96]:
                - listitem [ref=e97]:
                  - link "Map Upload" [ref=e98] [cursor=pointer]:
                    - /url: /admin/food/upload-map
                - listitem [ref=e99]:
                  - link "Stall Bookings" [ref=e100] [cursor=pointer]:
                    - /url: /admin/food/bookings
            - listitem [ref=e101]:
              - generic [ref=e102] [cursor=pointer]:
                - generic [ref=e103]:
                  - img [ref=e104]
                  - generic [ref=e109]: Artist Handling
                - img [ref=e110]
              - list [ref=e112]:
                - listitem [ref=e113]:
                  - link "Manage Artists" [ref=e114] [cursor=pointer]:
                    - /url: /admin/artists
                - listitem [ref=e115]:
                  - link "Ratings Analyze" [ref=e116] [cursor=pointer]:
                    - /url: /artists/analyze
            - listitem [ref=e117]:
              - link "Admin Profile" [ref=e118] [cursor=pointer]:
                - /url: /admin/profile
                - img [ref=e119]
                - generic [ref=e122]: Admin Profile
        - button "Log Out" [ref=e124] [cursor=pointer]:
          - img [ref=e125]
          - generic [ref=e128]: Log Out
      - main [ref=e130]:
        - generic [ref=e131]:
          - generic [ref=e132]:
            - generic [ref=e133]:
              - heading "Upcoming Events" [level=1] [ref=e134]
              - paragraph [ref=e135]: Review pending events and grant stage-by-stage approvals.
            - generic [ref=e137]:
              - generic [ref=e138]: Search
              - textbox "Find upcoming events..." [ref=e139]
              - button [ref=e140] [cursor=pointer]:
                - img [ref=e141]
          - generic [ref=e144]:
            - generic [ref=e145]:
              - generic [ref=e146]:
                - generic [ref=e148]: C
                - generic [ref=e149]: Register Required
              - generic [ref=e150]:
                - heading "Comprehensive Test Event 1777124954773" [level=3] [ref=e151]
                - generic [ref=e153]: 👤 Chaminda Saman
                - generic [ref=e154]:
                  - generic [ref=e155]:
                    - generic [ref=e156]: 📅
                    - text: Dec 31, 18:00
                  - generic [ref=e157]:
                    - generic [ref=e158]: 📍
                    - text: Venue 1777124954773
                  - generic [ref=e159]:
                    - generic [ref=e160]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e162] [cursor=pointer]
            - generic [ref=e163]:
              - generic [ref=e164]:
                - generic [ref=e166]: C
                - generic [ref=e167]: Register Required
              - generic [ref=e168]:
                - heading "Comprehensive Test Event 1777124443432" [level=3] [ref=e169]
                - generic [ref=e171]: 👤 Chaminda Saman
                - generic [ref=e172]:
                  - generic [ref=e173]:
                    - generic [ref=e174]: 📅
                    - text: Dec 31, 18:00
                  - generic [ref=e175]:
                    - generic [ref=e176]: 📍
                    - text: Venue 1777124443432
                  - generic [ref=e177]:
                    - generic [ref=e178]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e180] [cursor=pointer]
            - generic [ref=e181]:
              - generic [ref=e182]:
                - generic [ref=e184]: C
                - generic [ref=e185]: Register Required
              - generic [ref=e186]:
                - heading "Comprehensive Test Event 1777124233806" [level=3] [ref=e187]
                - generic [ref=e189]: 👤 Chaminda Saman
                - generic [ref=e190]:
                  - generic [ref=e191]:
                    - generic [ref=e192]: 📅
                    - text: Dec 31, 18:00
                  - generic [ref=e193]:
                    - generic [ref=e194]: 📍
                    - text: Venue 1777124233806
                  - generic [ref=e195]:
                    - generic [ref=e196]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e198] [cursor=pointer]
            - generic [ref=e199]:
              - generic [ref=e200]:
                - generic [ref=e202]: C
                - generic [ref=e203]: Register Required
              - generic [ref=e204]:
                - heading "Comprehensive Test Event 1777124084760" [level=3] [ref=e205]
                - generic [ref=e207]: 👤 Chaminda Saman
                - generic [ref=e208]:
                  - generic [ref=e209]:
                    - generic [ref=e210]: 📅
                    - text: Dec 31, 18:00
                  - generic [ref=e211]:
                    - generic [ref=e212]: 📍
                    - text: Venue 1777124084760
                  - generic [ref=e213]:
                    - generic [ref=e214]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e216] [cursor=pointer]
            - generic [ref=e217]:
              - generic [ref=e218]:
                - generic [ref=e220]: C
                - generic [ref=e221]: Register Required
              - generic [ref=e222]:
                - heading "Comprehensive Test Event 1777123824491" [level=3] [ref=e223]
                - generic [ref=e225]: 👤 Chaminda Saman
                - generic [ref=e226]:
                  - generic [ref=e227]:
                    - generic [ref=e228]: 📅
                    - text: Dec 31, 18:00
                  - generic [ref=e229]:
                    - generic [ref=e230]: 📍
                    - text: Venue 1777123824491
                  - generic [ref=e231]:
                    - generic [ref=e232]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e234] [cursor=pointer]
            - generic [ref=e235]:
              - generic [ref=e236]:
                - generic [ref=e238]: C
                - generic [ref=e239]: Register Required
              - generic [ref=e240]:
                - heading "Comprehensive Test Event 1777123725049" [level=3] [ref=e241]
                - generic [ref=e243]: 👤 Chaminda Saman
                - generic [ref=e244]:
                  - generic [ref=e245]:
                    - generic [ref=e246]: 📅
                    - text: Dec 31, 18:00
                  - generic [ref=e247]:
                    - generic [ref=e248]: 📍
                    - text: Main Auditorium
                  - generic [ref=e249]:
                    - generic [ref=e250]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e252] [cursor=pointer]
            - generic [ref=e253]:
              - generic [ref=e254]:
                - generic [ref=e256]: E
                - generic [ref=e257]: Register Required
              - generic [ref=e258]:
                - heading "E2E Event 1777123036309" [level=3] [ref=e259]
                - generic [ref=e261]: 👤 Chaminda Saman
                - generic [ref=e262]:
                  - generic [ref=e263]:
                    - generic [ref=e264]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e265]:
                    - generic [ref=e266]: 📍
                    - text: Hall 1777123036309
                  - generic [ref=e267]:
                    - generic [ref=e268]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e270] [cursor=pointer]
            - generic [ref=e271]:
              - generic [ref=e272]:
                - generic [ref=e274]: E
                - generic [ref=e275]: Register Required
              - generic [ref=e276]:
                - heading "E2E Event 1777122930918" [level=3] [ref=e277]
                - generic [ref=e279]: 👤 Chaminda Saman
                - generic [ref=e280]:
                  - generic [ref=e281]:
                    - generic [ref=e282]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e283]:
                    - generic [ref=e284]: 📍
                    - text: Hall 1777122930918
                  - generic [ref=e285]:
                    - generic [ref=e286]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e288] [cursor=pointer]
            - generic [ref=e289]:
              - generic [ref=e290]:
                - generic [ref=e292]: E
                - generic [ref=e293]: Register Required
              - generic [ref=e294]:
                - heading "E2E Event 1777122562879" [level=3] [ref=e295]
                - generic [ref=e297]: 👤 Chaminda Saman
                - generic [ref=e298]:
                  - generic [ref=e299]:
                    - generic [ref=e300]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e301]:
                    - generic [ref=e302]: 📍
                    - text: Hall 1777122562879
                  - generic [ref=e303]:
                    - generic [ref=e304]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e306] [cursor=pointer]
            - generic [ref=e307]:
              - generic [ref=e308]:
                - generic [ref=e310]: E
                - generic [ref=e311]: Register Required
              - generic [ref=e312]:
                - heading "E2E Event 1777121948165" [level=3] [ref=e313]
                - generic [ref=e315]: 👤 Chaminda Saman
                - generic [ref=e316]:
                  - generic [ref=e317]:
                    - generic [ref=e318]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e319]:
                    - generic [ref=e320]: 📍
                    - text: Hall 1777121948165
                  - generic [ref=e321]:
                    - generic [ref=e322]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e324] [cursor=pointer]
            - generic [ref=e325]:
              - generic [ref=e326]:
                - generic [ref=e328]: E
                - generic [ref=e329]: Register Required
              - generic [ref=e330]:
                - heading "E2E Event 1777121866792" [level=3] [ref=e331]
                - generic [ref=e333]: 👤 Chaminda Saman
                - generic [ref=e334]:
                  - generic [ref=e335]:
                    - generic [ref=e336]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e337]:
                    - generic [ref=e338]: 📍
                    - text: Hall 1777121866792
                  - generic [ref=e339]:
                    - generic [ref=e340]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e342] [cursor=pointer]
            - generic [ref=e343]:
              - generic [ref=e344]:
                - generic [ref=e346]: E
                - generic [ref=e347]: Register Required
              - generic [ref=e348]:
                - heading "E2E Event 1777121624776" [level=3] [ref=e349]
                - generic [ref=e351]: 👤 Chaminda Saman
                - generic [ref=e352]:
                  - generic [ref=e353]:
                    - generic [ref=e354]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e355]:
                    - generic [ref=e356]: 📍
                    - text: Hall 1777121624776
                  - generic [ref=e357]:
                    - generic [ref=e358]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e360] [cursor=pointer]
            - generic [ref=e361]:
              - generic [ref=e362]:
                - generic [ref=e364]: E
                - generic [ref=e365]: Register Required
              - generic [ref=e366]:
                - heading "E2E Event 1777121483791" [level=3] [ref=e367]
                - generic [ref=e369]: 👤 Chaminda Saman
                - generic [ref=e370]:
                  - generic [ref=e371]:
                    - generic [ref=e372]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e373]:
                    - generic [ref=e374]: 📍
                    - text: Hall 1777121483791
                  - generic [ref=e375]:
                    - generic [ref=e376]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e378] [cursor=pointer]
            - generic [ref=e379]:
              - generic [ref=e380]:
                - generic [ref=e382]: E
                - generic [ref=e383]: Register Required
              - generic [ref=e384]:
                - heading "E2E Event 1777121076916" [level=3] [ref=e385]
                - generic [ref=e387]: 👤 Chaminda Saman
                - generic [ref=e388]:
                  - generic [ref=e389]:
                    - generic [ref=e390]: 📅
                    - text: Dec 25, 18:00
                  - generic [ref=e391]:
                    - generic [ref=e392]: 📍
                    - text: Main Hall
                  - generic [ref=e393]:
                    - generic [ref=e394]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e396] [cursor=pointer]
            - generic [ref=e397]:
              - generic [ref=e398]:
                - generic [ref=e400]: h
                - generic [ref=e401]: Register Not Required
              - generic [ref=e402]:
                - heading "hjhghfg" [level=3] [ref=e403]
                - generic [ref=e404]:
                  - generic [ref=e405]: 👤 BUDARA H M K
                  - generic [ref=e406]: 🎤 nbjghh
                - generic [ref=e407]:
                  - generic [ref=e408]:
                    - generic [ref=e409]: 📅
                    - text: May 12, 22:18
                  - generic [ref=e410]:
                    - generic [ref=e411]: 📍
                    - text: ground
                  - generic [ref=e412]:
                    - generic [ref=e413]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e415] [cursor=pointer]
            - generic [ref=e416]:
              - generic [ref=e417]:
                - img "Padura" [ref=e418]
                - generic [ref=e419]: Register Not Required
              - generic [ref=e420]:
                - heading "Padura" [level=3] [ref=e421]
                - generic [ref=e423]: 👤 BUDARA H M K
                - generic [ref=e424]:
                  - generic [ref=e425]:
                    - generic [ref=e426]: 📅
                    - text: May 2, 21:03
                  - generic [ref=e427]:
                    - generic [ref=e428]: 📍
                    - text: wala
                  - generic [ref=e429]:
                    - generic [ref=e430]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e432] [cursor=pointer]
            - generic [ref=e433]:
              - generic [ref=e434]:
                - generic [ref=e436]: G
                - generic [ref=e437]: Register Required
              - generic [ref=e438]:
                - heading "Ganthera" [level=3] [ref=e439]
                - generic [ref=e441]: 👤 Chaminda Saman
                - generic [ref=e442]:
                  - generic [ref=e443]:
                    - generic [ref=e444]: 📅
                    - text: Mar 26, 06:00
                  - generic [ref=e445]:
                    - generic [ref=e446]: 📍
                    - text: wala
                  - generic [ref=e447]:
                    - generic [ref=e448]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e450] [cursor=pointer]
            - generic [ref=e451]:
              - generic [ref=e452]:
                - generic [ref=e454]: s
                - generic [ref=e455]: Register Not Required
              - generic [ref=e456]:
                - heading "ssssssssssssssssssssssssss" [level=3] [ref=e457]
                - generic [ref=e459]: 👤 BUDARA H M K
                - generic [ref=e460]:
                  - generic [ref=e461]:
                    - generic [ref=e462]: 📅
                    - text: Apr 3, 15:47
                  - generic [ref=e463]:
                    - generic [ref=e464]: 📍
                    - text: vcfgdff
                  - generic [ref=e465]:
                    - generic [ref=e466]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e468] [cursor=pointer]
            - generic [ref=e469]:
              - generic [ref=e470]:
                - img "cdd" [ref=e471]
                - generic [ref=e472]: Register Required
              - generic [ref=e473]:
                - heading "cdd" [level=3] [ref=e474]
                - generic [ref=e476]: 👤 herath
                - generic [ref=e477]:
                  - generic [ref=e478]:
                    - generic [ref=e479]: 📅
                    - text: Mar 27, 15:24
                  - generic [ref=e480]:
                    - generic [ref=e481]: 📍
                    - text: e
                  - generic [ref=e482]:
                    - generic [ref=e483]: 🎟️
                    - text: Free
                - button "Review Event Details" [ref=e485] [cursor=pointer]
  - contentinfo [ref=e486]:
    - generic [ref=e487]:
      - generic [ref=e488]:
        - heading "Eventio" [level=2] [ref=e489]
        - paragraph [ref=e490]: Making your campus events unforgettable.
        - generic [ref=e491]:
          - link "Facebook" [ref=e492] [cursor=pointer]:
            - /url: "#"
            - text: 📘
          - link "Twitter" [ref=e493] [cursor=pointer]:
            - /url: "#"
            - text: 🐦
          - link "Instagram" [ref=e494] [cursor=pointer]:
            - /url: "#"
            - text: 📸
          - link "LinkedIn" [ref=e495] [cursor=pointer]:
            - /url: "#"
            - text: 💼
      - generic [ref=e496]:
        - heading "SLIIT Faculties" [level=3] [ref=e497]
        - list [ref=e498]:
          - listitem [ref=e499] [cursor=pointer]: → Faculty of Computing
          - listitem [ref=e500] [cursor=pointer]: → Faculty of Business
          - listitem [ref=e501] [cursor=pointer]: → Faculty of Engineering
          - listitem [ref=e502] [cursor=pointer]: → Faculty of Humanities & Sciences
          - listitem [ref=e503] [cursor=pointer]: → School of Architecture
    - paragraph [ref=e505]: © 2026 Eventio - SLIIT. All Rights Reserved.
```

# Test source

```ts
  84  |     await page.selectOption('select#role', 'organizer');
  85  |     await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
  86  |     await page.fill('input[placeholder="Enter Password"]', '123456');
  87  |     await page.click('button[type="submit"]', { force: true });
  88  |     
  89  |     // Navigate to Chat
  90  |     await page.goto(`${BASE_URL}/organizer/messages`);
  91  |     await page.waitForLoadState('domcontentloaded');
  92  |     
  93  |     // Wait for either contacts or no-contacts message
  94  |     const contactItem = page.locator('.contact-item');
  95  |     const noContactsMsg = page.getByText(/No contacts found/i);
  96  |     
  97  |     await Promise.race([
  98  |         contactItem.first().waitFor({ state: 'visible', timeout: 15000 }),
  99  |         noContactsMsg.waitFor({ state: 'visible', timeout: 15000 })
  100 |     ]).catch(() => {});
  101 |     
  102 |     if (!(await contactItem.first().isVisible())) {
  103 |         console.log('⚠️ No contacts found. Skipping chat test.');
  104 |         return;
  105 |     }
  106 |     
  107 |     await contactItem.first().click();
  108 |     
  109 |     const messageContent = `Support Request: ${Date.now()}`;
  110 |     const chatInput = page.locator('input[placeholder*="Type your message"]');
  111 |     await chatInput.waitFor({ state: 'visible', timeout: 5000 });
  112 |     await chatInput.fill(messageContent);
  113 |     await page.click('button[type="submit"]');
  114 |     
  115 |     await expect(page.locator('.message-bubble').filter({ hasText: messageContent }).first()).toBeVisible({ timeout: 10000 });
  116 |     console.log('✅ Chat Message Sent to Admin');
  117 |   });
  118 | 
  119 |   test('Step 3: Admin - Search, Review, Chat Reply & Approve', async ({ page }) => {
  120 |     console.log('\n▶️ [Admin] Search, Chat Reply & Multi-Stage Approval');
  121 |     
  122 |     // Login
  123 |     await page.goto(`${BASE_URL}/login`);
  124 |     await page.selectOption('select#role', 'admin');
  125 |     await page.waitForTimeout(1000); // Wait for auto-fill
  126 |     await page.click('button[type="submit"]', { force: true });
  127 |     await page.waitForURL(/admin\/dashboard/);
  128 | 
  129 |     // 1. Search Bar Testing
  130 |     await page.goto(`${BASE_URL}/admin/events/upcoming`);
  131 |     await page.fill('input[placeholder*="Find upcoming events"]', eventTitle);
  132 |     const eventCard = page.locator('.event-card').filter({ hasText: eventTitle });
  133 |     await expect(eventCard).toBeVisible({ timeout: 10000 });
  134 |     console.log('✅ Search Bar Working: Found Created Event');
  135 | 
  136 |     // 2. Chat Reply
  137 |     await page.goto(`${BASE_URL}/admin/messages`);
  138 |     await page.waitForLoadState('domcontentloaded');
  139 |     
  140 |     // Click any contact if "Chaminda" not found
  141 |     const organizerContact = page.locator('.contact-item').filter({ hasText: 'Chaminda' }).first();
  142 |     const fallbackContact = page.locator('.contact-item').first();
  143 |     
  144 |     if (await organizerContact.isVisible()) {
  145 |         await organizerContact.click();
  146 |     } else if (await fallbackContact.isVisible()) {
  147 |         await fallbackContact.click();
  148 |     }
  149 |     
  150 |     const replyContent = `Admin Response: Acknowledged.`;
  151 |     const chatInputAdmin = page.locator('input[placeholder*="Type your message"]');
  152 |     if (await chatInputAdmin.isVisible({ timeout: 5000 })) {
  153 |         await chatInputAdmin.fill(replyContent);
  154 |         await page.click('button[type="submit"]');
  155 |         console.log('✅ Chat Reply Sent to Organizer');
  156 |     }
  157 | 
  158 |     // 3. Multi-Stage Approval
  159 |     await page.goto(`${BASE_URL}/admin/events/upcoming`);
  160 |     await page.fill('input[placeholder*="Find upcoming events"]', eventTitle);
  161 |     await page.locator('.event-card').filter({ hasText: eventTitle }).locator('button:has-text("Review")').click();
  162 |     
  163 |     // Toggle 4 stages
  164 |     await page.waitForSelector('label.approval-stage-card');
  165 |     const labels = page.locator('label.approval-stage-card');
  166 |     for (let i = 0; i < 4; i++) {
  167 |       console.log(`Checking Stage ${i+1}...`);
  168 |       const currentLabel = labels.nth(i);
  169 |       if (!(await currentLabel.getAttribute('class')).includes('checked')) {
  170 |           const respPromise = page.waitForResponse(r => r.url().includes('/approval') && r.status() === 200);
  171 |           await currentLabel.click({ force: true });
  172 |           await respPromise;
  173 |           await page.waitForTimeout(500); // Allow state to settle
  174 |       }
  175 |       await expect(labels.nth(i)).toHaveClass(/checked/, { timeout: 10000 });
  176 |     }
  177 |     
  178 |     // Publish
  179 |     console.log('Publishing Event...');
  180 |     page.once('dialog', d => d.accept());
  181 |     const publishBtn = page.locator('button:has-text("Publish Event")');
  182 |     await expect(publishBtn).toBeEnabled({ timeout: 10000 });
  183 |     await publishBtn.click();
> 184 |     await page.waitForURL(/admin\/events\/approved/, { timeout: 30000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  185 |     console.log('✅ Admin Multi-Stage Approval Successful');
  186 |   });
  187 | 
  188 |   test('Step 4: User - Search, Register & Notification', async ({ page }) => {
  189 |     console.log('\n▶️ [User] Search, Register & Notification');
  190 |     
  191 |     // Login
  192 |     await page.goto(`${BASE_URL}/login`);
  193 |     await page.selectOption('select#role', 'user');
  194 |     await page.fill('input[placeholder="Enter Email"]', 'user@gmail.com');
  195 |     await page.fill('input[placeholder="Enter Password"]', '123456');
  196 |     await page.click('button[type="submit"]', { force: true });
  197 |     await page.waitForURL(/dashboard/);
  198 | 
  199 |     // 1. Search Bar Testing
  200 |     await page.fill('input[placeholder*="Search for events"]', eventTitle);
  201 |     const eventCard = page.locator('.event-card').filter({ hasText: eventTitle });
  202 |     await expect(eventCard).toBeVisible({ timeout: 10000 });
  203 |     console.log('✅ Search Bar Working: Found Approved Event');
  204 | 
  205 |     // 2. Register
  206 |     await eventCard.locator('button:has-text("Register Now")').click();
  207 |     await page.fill('input[placeholder="Jane Doe"]', 'Test User');
  208 |     await page.fill('input[placeholder="IT21XXXXXX"]', 'IT21000000');
  209 |     await page.selectOption('select', 'Year 3');
  210 |     
  211 |     page.once('dialog', d => d.accept());
  212 |     await page.click('button:has-text("Submit Registration")');
  213 |     await expect(page.locator('h2, h3, div').filter({ hasText: /registered successfully|success/i }).first()).toBeVisible({ timeout: 15000 });
  214 |     console.log('✅ User Registration Successful');
  215 | 
  216 |     // 3. Notification Check
  217 |     await page.click('.notification-bell');
  218 |     const regNotif = page.locator('.notification-item').filter({ hasText: /successfully registered/i }).first();
  219 |     await expect(regNotif).toBeVisible();
  220 |     console.log('✅ Notification Received: Registration Success');
  221 |   });
  222 | 
  223 |   test('Step 5: Organizer - Track & Approve Registration', async ({ page }) => {
  224 |     console.log('\n▶️ [Organizer] Tracking & Approval');
  225 |     
  226 |     // Login
  227 |     await page.goto(`${BASE_URL}/login`);
  228 |     await page.selectOption('select#role', 'organizer');
  229 |     await page.fill('input[placeholder="Enter Email"]', 'chaminda@gmail.com');
  230 |     await page.fill('input[placeholder="Enter Password"]', '123456');
  231 |     await page.click('button[type="submit"]', { force: true });
  232 | 
  233 |     // 1. Notification Check
  234 |     await page.click('.notification-bell');
  235 |     const newRegNotif = page.locator('.notification-item').filter({ hasText: eventTitle }).filter({ hasText: /new registration/i }).first();
  236 |     await expect(newRegNotif).toBeVisible();
  237 |     console.log('✅ Notification Received: New Registration');
  238 | 
  239 |     // 2. Track Event
  240 |     await page.goto(`${BASE_URL}/organizer/track`);
  241 |     const trackRow = page.locator('.track-card').filter({ hasText: eventTitle });
  242 |     await expect(trackRow).toBeVisible();
  243 |     await expect(trackRow.locator('.stat-value', { hasText: '1' })).toBeVisible(); // 1 Registration
  244 |     console.log('✅ Event Tracking Correct: 1 Registration Found');
  245 | 
  246 |     // 3. Approve Registration
  247 |     await page.goto(`${BASE_URL}/organizer/registrations`);
  248 |     const regRow = page.locator('.glass-panel').filter({ hasText: eventTitle }).first();
  249 |     await expect(regRow).toBeVisible();
  250 |     await regRow.locator('button:has-text("Approve")').click();
  251 |     await page.waitForTimeout(1000);
  252 |     console.log('✅ Organizer Registration Approval Successful');
  253 |   });
  254 | 
  255 |   test('Step 6: User - Ticket Download', async ({ page }) => {
  256 |     console.log('\n▶️ [User] Ticket Download');
  257 |     
  258 |     // Login
  259 |     await page.goto(`${BASE_URL}/login`);
  260 |     await page.selectOption('select#role', 'user');
  261 |     await page.fill('input[placeholder="Enter Email"]', 'user@gmail.com');
  262 |     await page.fill('input[placeholder="Enter Password"]', '123456');
  263 |     await page.click('button[type="submit"]', { force: true });
  264 | 
  265 |     // 1. Notification Check
  266 |     await page.click('.notification-bell');
  267 |     const approvedNotif = page.locator('.notification-item').filter({ hasText: eventTitle }).filter({ hasText: /been approved/i }).first();
  268 |     await expect(approvedNotif).toBeVisible();
  269 |     console.log('✅ Notification Received: Registration Approved');
  270 | 
  271 |     // 2. Download Ticket
  272 |     await page.goto(`${BASE_URL}/user/tickets`);
  273 |     const ticketCard = page.locator('.glass-panel').filter({ hasText: eventTitle }).first();
  274 |     await expect(ticketCard.locator('.status-badge')).toContainText('Approved');
  275 |     
  276 |     await ticketCard.locator('button:has-text("View Ticket")').click();
  277 |     const downloadPromise = page.waitForEvent('download');
  278 |     await page.click('button:has-text("Download Ticket as Image")');
  279 |     const download = await downloadPromise;
  280 |     console.log(`✅ Ticket Downloaded: ${download.suggestedFilename()}`);
  281 |   });
  282 | });
  283 | 
```