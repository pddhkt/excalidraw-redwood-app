"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "./magicLinkFunctions";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { Alert, AlertDescription } from "@/app/components/ui/Alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";

export function Login() {
  const [email, setEmail] = useState("");
  const [alertState, setAlertState] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const handleSendMagicLink = async () => {
    try {
      setAlertState({ type: null, message: "" });

      if (!email.trim()) {
        setAlertState({ type: "error", message: "Please enter your email address" });
        return;
      }

      const result = await sendMagicLink(email);

      if (result.success) {
        setEmailSent(true);
        setAlertState({
          type: "success",
          message: result.isNewUser
            ? "Welcome! Check your email for the onboarding link."
            : "Welcome back! Check your email for the login link."
        });
      } else {
        setAlertState({ type: "error", message: result.message });
      }
    } catch (error) {
      setAlertState({
        type: "error",
        message: "Something went wrong. Please try again."
      });
    }
  };

  const handleSendMagicLinkTransition = () => {
    startTransition(() => void handleSendMagicLink());
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setAlertState({ type: null, message: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {emailSent ? "Check your email" : "Welcome to Excalidraw"}
          </CardTitle>
          <CardDescription className="text-center">
            {emailSent
              ? "We've sent you a magic link to sign in"
              : "Enter your email to sign in or create an account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!emailSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isPending}
                  autoComplete="email"
                  required
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && email.trim()) {
                      handleSendMagicLinkTransition();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  We'll send you a magic link - no password needed!
                </p>
              </div>

              {alertState.type && (
                <Alert variant={alertState.type === "error" ? "destructive" : "success"}>
                  <AlertDescription>{alertState.message}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSendMagicLinkTransition}
                disabled={isPending || !email.trim()}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Sending magic link...
                  </span>
                ) : (
                  "Send Magic Link"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Magic link sent!</p>
                  <p className="text-sm text-muted-foreground">
                    Check your email at <strong>{email}</strong> and click the link to sign in.
                  </p>
                </div>
              </div>

              {alertState.type && (
                <Alert variant={alertState.type === "error" ? "destructive" : "success"}>
                  <AlertDescription>{alertState.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Use different email
                </Button>
                <Button
                  onClick={handleSendMagicLinkTransition}
                  disabled={isPending}
                  variant="ghost"
                  className="w-full"
                  size="sm"
                >
                  Resend magic link
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
