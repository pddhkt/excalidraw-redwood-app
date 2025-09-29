"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyMagicLink } from "../../pages/user/magicLinkFunctions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Alert, AlertDescription } from "@/app/components/ui/Alert";
import { Button } from "@/app/components/ui/Button";

export default function VerifyMagicLink() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationState, setVerificationState] = useState<{
    status: "loading" | "success" | "error";
    message: string;
  }>({ status: "loading", message: "" });

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setVerificationState({
        status: "error",
        message: "Invalid verification link. Please request a new one."
      });
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyMagicLink(token, email);

        if (result.success) {
          setVerificationState({
            status: "success",
            message: "Successfully signed in! Redirecting to your dashboard..."
          });

          // Store session token if provided
          if (result.sessionToken) {
            localStorage.setItem("sessionToken", result.sessionToken);
          }

          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setVerificationState({
            status: "error",
            message: result.message
          });
        }
      } catch (error) {
        setVerificationState({
          status: "error",
          message: "Failed to verify login link. Please try again."
        });
      }
    };

    verify();
  }, [searchParams, router]);

  const handleReturnToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {verificationState.status === "loading" && "Verifying..."}
            {verificationState.status === "success" && "Welcome!"}
            {verificationState.status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {verificationState.status === "loading" && "Please wait while we verify your login link"}
            {verificationState.status === "success" && "You have been successfully signed in"}
            {verificationState.status === "error" && "There was a problem with your login link"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationState.status === "loading" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
              <p className="text-sm text-muted-foreground">
                Verifying your identity...
              </p>
            </div>
          )}

          {verificationState.status === "success" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {verificationState.status === "error" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}

          <Alert variant={verificationState.status === "error" ? "destructive" : "success"}>
            <AlertDescription>{verificationState.message}</AlertDescription>
          </Alert>

          {verificationState.status === "error" && (
            <Button
              onClick={handleReturnToLogin}
              className="w-full"
            >
              Back to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}