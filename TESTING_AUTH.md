# Testing Passkey Authentication

## 🔧 Setup Requirements

### Environment Variables
Make sure these are set in your `.env` file:
```env
# WebAuthn Configuration
WEBAUTHN_RP_ID=localhost  # For local testing
WEBAUTHN_APP_NAME=Excalidraw Development
DATABASE_URL="your-database-connection-string"
```

### Compatible Testing Environments
- **Chrome/Edge**: Works with Windows Hello, Touch ID, fingerprint
- **Safari**: Works with Touch ID, Face ID on macOS/iOS
- **Firefox**: Limited support, best on Windows
- **Mobile**: Works great on iOS Safari, Android Chrome

## 🚀 Testing Steps

### Step 1: Start Development Server
```bash
# Start the development server with HTTPS
npm run dev
# or
pnpm dev

# Access at https://localhost:3000 (HTTPS required for passkeys)
```

### Step 2: Test User Registration
1. Go to `/login` page
2. Enter a username (e.g., "testuser123")
3. Click **"Create New Account"**
4. Browser should prompt for:
   - Windows: Windows Hello PIN/biometric
   - Mac: Touch ID or system password
   - Mobile: Fingerprint/Face ID
5. Check browser console for any errors
6. Should see success message

### Step 3: Test User Login
1. Stay on login page or refresh
2. Enter the same username
3. Click **"Sign in with Passkey"**
4. Browser should prompt for authentication
5. Should successfully log in

### Step 4: Test Error Cases
1. **Invalid username**: Try logging in with non-existent user
2. **Cancel auth**: Cancel the biometric prompt
3. **Network issues**: Test with dev tools network throttling

## 🐛 Common Issues & Solutions

### Issue: "Passkey not supported"
- **Solution**: Use HTTPS, not HTTP
- **Check**: Browser compatibility
- **Try**: Different browser (Chrome works best)

### Issue: "No credentials found"
- **Solution**: Make sure you registered first
- **Check**: Database connection
- **Try**: Clear browser data and re-register

### Issue: "Challenge expired"
- **Solution**: Refresh page and try again
- **Check**: Session storage configuration

### Issue: Functions not found
- **Solution**: Make sure you're importing from the right path:
```typescript
import {
  finishPasskeyLogin,
  finishPasskeyRegistration,
  startPasskeyLogin,
  startPasskeyRegistration,
} from "./functions";
```

## 📱 Device-Specific Testing

### Windows (Chrome/Edge)
- Uses Windows Hello
- PIN, fingerprint, or face recognition
- Works reliably

### macOS (Safari/Chrome)
- Uses Touch ID
- Very smooth experience
- Safari works best

### iOS (Safari)
- Face ID or Touch ID
- Excellent mobile experience
- Test in Safari browser

### Android (Chrome)
- Fingerprint or face unlock
- Good compatibility
- Use Chrome browser

## 🔍 Debugging Tools

### Browser DevTools
1. Open **Application > Storage**
2. Check **Cookies** for session data
3. **Console** for JavaScript errors
4. **Network** tab for API calls

### Database Inspection
Check these tables after registration:
- `User` table: Should have new user
- `Credential` table: Should have passkey data

### Console Logs
Add debugging to the functions:
```typescript
console.log("Starting passkey registration for:", username);
console.log("Registration options:", options);
console.log("Registration result:", result);
```

## 🧪 Automated Testing

### Unit Tests
Test the authentication functions:
```typescript
// Test registration flow
it('should register new user with passkey', async () => {
  const username = 'testuser';
  const options = await startPasskeyRegistration(username);
  expect(options).toBeDefined();
  expect(options.challenge).toBeTruthy();
});
```

### Integration Tests
Test the full UI flow with Playwright:
```typescript
test('passkey registration flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'testuser');
  await page.click('button:has-text("Create New Account")');
  // Note: Can't fully test biometric prompt in automation
});
```

## 🎯 What to Look For

### ✅ Success Indicators
- No console errors
- Biometric prompts appear
- Success alerts show
- Database entries created
- Session established

### ❌ Failure Signs
- Console errors about WebAuthn
- No biometric prompts
- "Not supported" messages
- Database connection errors
- Session not created

## 🔐 Security Testing

### Test Cases
1. **Replay attacks**: Old challenges should be rejected
2. **Cross-origin**: Should only work on correct domain
3. **Session expiry**: Test with expired sessions
4. **Invalid credentials**: Test with tampered data