#!/bin/bash

echo "🔧 Testing Passkey Authentication Setup"
echo "======================================"

# Check if required dependencies are installed
echo "📦 Checking dependencies..."

if npm list @simplewebauthn/browser @simplewebauthn/server >/dev/null 2>&1; then
    echo "✅ WebAuthn dependencies installed"
else
    echo "❌ WebAuthn dependencies missing"
    echo "   Run: npm install @simplewebauthn/browser @simplewebauthn/server"
fi

# Check if key files exist
echo ""
echo "📁 Checking authentication files..."

if [ -f "src/app/pages/user/functions.ts" ]; then
    echo "✅ Authentication functions found"
else
    echo "❌ Authentication functions missing"
fi

if [ -f "src/app/pages/user/Login.tsx" ]; then
    echo "✅ Login component found"
else
    echo "❌ Login component missing"
fi

# Check database schema
echo ""
echo "🗄️ Checking database schema..."
if [ -f "prisma/schema.prisma" ]; then
    if grep -q "model User" prisma/schema.prisma && grep -q "model Credential" prisma/schema.prisma; then
        echo "✅ Database schema looks good"
    else
        echo "❌ Database schema missing User or Credential models"
    fi
else
    echo "❌ Prisma schema not found"
fi

# Check environment setup
echo ""
echo "🌍 Environment checks..."
if [ -f ".env" ]; then
    echo "✅ Environment file found"
    if grep -q "WEBAUTHN_" .env; then
        echo "✅ WebAuthn configuration present"
    else
        echo "⚠️  WebAuthn configuration missing in .env"
        echo "   Add: WEBAUTHN_RP_ID=localhost"
        echo "   Add: WEBAUTHN_APP_NAME=Your App Name"
    fi
else
    echo "❌ .env file not found"
    echo "   Create .env with WEBAUTHN_RP_ID and WEBAUTHN_APP_NAME"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Run: npm run dev"
echo "2. Visit: https://localhost:3000/login (HTTPS required!)"
echo "3. Test registration with any username"
echo "4. Test login with same username"
echo ""
echo "📱 Device requirements:"
echo "   - Windows: Windows Hello, PIN, or biometric"
echo "   - Mac: Touch ID or system password"
echo "   - Mobile: Fingerprint or Face ID"
echo ""
echo "🔍 Troubleshooting:"
echo "   - Use Chrome/Edge for best compatibility"
echo "   - Must use HTTPS (not HTTP)"
echo "   - Check browser console for errors"
echo "   - See TESTING_AUTH.md for detailed guide"