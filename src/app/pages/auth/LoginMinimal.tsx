"use client";

import { useState, useTransition } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  finishPasskeyLogin,
  finishPasskeyRegistration,
  startPasskeyLogin,
  startPasskeyRegistration,
} from "@/app/pages/auth/functions";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Alert, AlertDescription } from "@/app/components/ui/Alert";

export function LoginMinimal() {
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [alertState, setAlertState] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isPending, startTransition] = useTransition();

  const passkeyLogin = async () => {
    try {
      setAlertState({ type: null, message: "" });
      const options = await startPasskeyLogin();
      const login = await startAuthentication({ optionsJSON: options });
      const success = await finishPasskeyLogin(login, rememberMe);

      if (!success) {
        setAlertState({ type: "error", message: "Login failed. Please try again." });
      } else {
        setAlertState({ type: "success", message: "Login successful! Redirecting..." });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    } catch (error) {
      setAlertState({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  };

  const passkeyRegister = async () => {
    try {
      setAlertState({ type: null, message: "" });

      if (!username.trim()) {
        setAlertState({ type: "error", message: "Please enter a username" });
        return;
      }

      const options = await startPasskeyRegistration(username);
      const registration = await startRegistration({ optionsJSON: options });
      const success = await finishPasskeyRegistration(username, registration);

      if (!success) {
        setAlertState({ type: "error", message: "Registration failed. Username may already exist." });
      } else {
        setAlertState({ type: "success", message: "Registration successful! Redirecting..." });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    } catch (error) {
      setAlertState({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  };

  const handlePerformPasskeyLogin = () => {
    startTransition(() => void passkeyLogin());
  };

  const handlePerformPasskeyRegister = () => {
    startTransition(() => void passkeyRegister());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Use your passkey to continue
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={isPending}
              autoComplete="username"
              required
              onKeyDown={(e) => {
                if (e.key === "Enter" && username.trim()) {
                  handlePerformPasskeyLogin();
                }
              }}
            />
          </div>

          {alertState.type && (
            <Alert variant={alertState.type === "error" ? "destructive" : "success"}>
              <AlertDescription>{alertState.message}</AlertDescription>
            </Alert>
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-muted-foreground">Remember for 30 days</span>
          </label>

          <div className="space-y-2">
            <Button
              onClick={handlePerformPasskeyLogin}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <Button
              onClick={handlePerformPasskeyRegister}
              disabled={isPending || !username.trim()}
              variant="outline"
              className="w-full"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Creating...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Secured with passkey authentication
          </p>
        </div>
      </div>
    </div>
  );
}
