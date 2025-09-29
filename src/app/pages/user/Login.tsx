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
} from "./functions";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { Alert, AlertDescription } from "@/app/components/ui/Alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";

export function Login() {
  const [username, setUsername] = useState("");
  const [alertState, setAlertState] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isPending, startTransition] = useTransition();

  const passkeyLogin = async () => {
    try {
      setAlertState({ type: null, message: "" });

      // 1. Get a challenge from the worker
      const options = await startPasskeyLogin();

      // 2. Ask the browser to sign the challenge
      const login = await startAuthentication({ optionsJSON: options });

      // 3. Give the signed challenge to the worker to finish the login process
      const success = await finishPasskeyLogin(login);

      if (!success) {
        setAlertState({ type: "error", message: "Login failed. Please try again." });
      } else {
        setAlertState({ type: "success", message: "Login successful! Redirecting..." });
        // TODO: Redirect to dashboard after successful login
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

      // 1. Get a challenge from the worker
      const options = await startPasskeyRegistration(username);

      // 2. Ask the browser to sign the challenge
      const registration = await startRegistration({ optionsJSON: options });

      // 3. Give the signed challenge to the worker to finish the registration process
      const success = await finishPasskeyRegistration(username, registration);

      if (!success) {
        setAlertState({ type: "error", message: "Registration failed. Username may already exist." });
      } else {
        setAlertState({ type: "success", message: "Registration successful! You can now login." });
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
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isPending}
              autoComplete="username"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use this username for both login and registration
            </p>
          </div>

          {alertState.type && (
            <Alert variant={alertState.type === "error" ? "destructive" : "success"}>
              <AlertDescription>{alertState.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Choose an action
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Button
                onClick={handlePerformPasskeyLogin}
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Authenticating...
                  </span>
                ) : (
                  "Sign in with Passkey"
                )}
              </Button>

              <Button
                onClick={handlePerformPasskeyRegister}
                disabled={isPending || !username.trim()}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Creating account...
                  </span>
                ) : (
                  "Create New Account"
                )}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
