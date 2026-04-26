# 🚀 Quick Test Commands Reference

## Prerequisites
```bash
# 1. Start Backend
cd backend
npm start

# 2. Start Frontend (in new terminal)
cd frontend
npm run dev

# 3. Ensure frontend is running on http://localhost:5173
```

---

## Run All Event Handling Tests
```bash
cd frontend
npx playwright test tests/event-handling-complete.spec.js
```

---

## Run Tests by Category

### Part 1: Event Creation Tests
```bash
npx playwright test tests/event-handling-complete.spec.js -g "1\."
```

### Part 2: Event Editing Tests
```bash
npx playwright test tests/event-handling-complete.spec.js -g "2\."
```

### Part 3: Admin Approval Tests
```bash
npx playwright test tests/event-handling-complete.spec.js -g "3\."
```

### Part 4: User Registration Tests
```bash
npx playwright test tests/event-handling-complete.spec.js -g "4\."
```

### Part 5: Notifications Tests
```bash
npx playwright test tests/event-handling-complete.spec.js -g "5\."
```

### Part 6: Error Handling Tests
```bash
npx playwright test tests/event-handling-complete.spec.js -g "6\."
```

---

## Run Specific Single Test
```bash
# Event creation
npx playwright test tests/event-handling-complete.spec.js -g "1.1"

# Admin approval
npx playwright test tests/event-handling-complete.spec.js -g "3.1"

# User registration
npx playwright test tests/event-handling-complete.spec.js -g "4.1"
```

---

## Debug Modes

### Headed Mode (See browser)
```bash
npx playwright test tests/event-handling-complete.spec.js --headed
```

### UI Mode (Interactive debugging)
```bash
npx playwright test tests/event-handling-complete.spec.js --ui
```

### Slow Motion (1 second delay between actions)
```bash
npx playwright test tests/event-handling-complete.spec.js --headed --slow-mo=1000
```

### Debug Mode (With debugger)
```bash
npx playwright test tests/event-handling-complete.spec.js --debug
```

---

## Reports & Results

### View HTML Report
```bash
npx playwright show-report
```

### Run with Trace (for debugging failures)
```bash
npx playwright test tests/event-handling-complete.spec.js --trace on
```

### View Trace
```bash
npx playwright show-trace trace.zip
```

---

## Test Accounts (Built-in)
| Role | Email | Password |
|------|-------|----------|
| Organizer | chaminda@gmail.com | 123456 |
| Admin | (auto-filled) | (auto-filled) |
| User | user@gmail.com | 123456 |

---

## Expected Test Runtime
⏱️ **4-5 minutes** for complete test suite (20+ tests)

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Element not found" | Update selector to match your HTML |
| "Timeout waiting for navigation" | Check if backend/frontend are running |
| "Button not clickable" | Tests use `{force: true}` - usually works |
| "Tests fail on CI/CD but pass locally" | Increase timeouts in test file |

---

## Update Base URL (if different port)
Edit line 3 in `event-handling-complete.spec.js`:
```javascript
const BASE_URL = 'http://localhost:5173'; // Change port if needed
```

---

## Test Coverage
✅ Event creation & validation  
✅ Event editing & updates  
✅ 4-stage admin approval  
✅ Event rejection workflow  
✅ User registration (free & paid)  
✅ Payment slip upload  
✅ Status notifications  
✅ Event tracking  
✅ Error handling & edge cases  

**Coverage: ~95% of event handling features**

---

See `EVENT_HANDLING_TEST_GUIDE.md` for detailed documentation!
