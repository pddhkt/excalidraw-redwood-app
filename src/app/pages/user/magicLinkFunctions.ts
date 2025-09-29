"use server";

export async function sendMagicLink(email: string): Promise<{
  success: boolean;
  message: string;
  isNewUser?: boolean;
}> {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address"
      };
    }

    // Check if user exists in database
    // TODO: Replace with actual database check
    const userExists = await checkUserExists(email);

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database with expiration
    await storeLoginToken(email, token, expiresAt);

    // Create magic link
    const magicLink = `${process.env.APP_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Send appropriate email
    if (userExists) {
      await sendWelcomeBackEmail(email, magicLink);
    } else {
      await sendOnboardingEmail(email, magicLink);
    }

    return {
      success: true,
      message: "Check your email for the login link!",
      isNewUser: !userExists
    };
  } catch (error) {
    console.error("Error sending magic link:", error);
    return {
      success: false,
      message: "Failed to send login email. Please try again."
    };
  }
}

export async function verifyMagicLink(token: string, email: string): Promise<{
  success: boolean;
  message: string;
  sessionToken?: string;
}> {
  try {
    // Validate token format
    if (!token || token.length < 32) {
      return {
        success: false,
        message: "Invalid login link"
      };
    }

    // Check token in database
    const storedToken = await getLoginToken(email, token);

    if (!storedToken) {
      return {
        success: false,
        message: "Invalid or expired login link"
      };
    }

    // Check expiration
    if (new Date() > storedToken.expiresAt) {
      await deleteLoginToken(token);
      return {
        success: false,
        message: "Login link has expired. Please request a new one."
      };
    }

    // Create or get user
    const user = await findOrCreateUser(email);

    // Create session
    const sessionToken = await createSession(user.id);

    // Delete used token
    await deleteLoginToken(token);

    return {
      success: true,
      message: "Successfully logged in!",
      sessionToken
    };
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return {
      success: false,
      message: "Failed to verify login link"
    };
  }
}

// Helper functions (to be implemented with actual database)
async function checkUserExists(email: string): Promise<boolean> {
  // TODO: Implement database check
  // For now, simulate with localStorage or API call
  return false;
}

async function generateSecureToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function storeLoginToken(email: string, token: string, expiresAt: Date): Promise<void> {
  // TODO: Store in database
  console.log("Storing token for", email);
}

async function getLoginToken(email: string, token: string): Promise<any> {
  // TODO: Retrieve from database
  return null;
}

async function deleteLoginToken(token: string): Promise<void> {
  // TODO: Delete from database
}

async function findOrCreateUser(email: string): Promise<any> {
  // TODO: Find or create user in database
  return { id: "user-123", email };
}

async function createSession(userId: string): Promise<string> {
  // TODO: Create session in database
  return generateSecureToken();
}

async function sendWelcomeBackEmail(email: string, magicLink: string): Promise<void> {
  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  console.log(`
    To: ${email}
    Subject: Welcome back to Excalidraw!

    Hello!

    Welcome back! Click the link below to sign in to your account:

    ${magicLink}

    This link will expire in 15 minutes for security reasons.

    If you didn't request this email, you can safely ignore it.

    Best regards,
    The Excalidraw Team
  `);
}

async function sendOnboardingEmail(email: string, magicLink: string): Promise<void> {
  // TODO: Integrate with email service
  console.log(`
    To: ${email}
    Subject: Welcome to Excalidraw! 🎨

    Hello!

    Welcome to Excalidraw! We're excited to have you join our community.

    Click the link below to create your account and get started:

    ${magicLink}

    This link will expire in 15 minutes for security reasons.

    What you can do with Excalidraw:
    • Create beautiful hand-drawn diagrams
    • Collaborate in real-time
    • Save and organize your drawings

    If you didn't request this email, you can safely ignore it.

    Best regards,
    The Excalidraw Team
  `);
}