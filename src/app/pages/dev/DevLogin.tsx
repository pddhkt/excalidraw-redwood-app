"use client";

import { useEffect, useState } from "react";

export function DevLogin() {
  const [status, setStatus] = useState<"setting" | "success" | "error">("setting");

  useEffect(() => {
    try {
      // Set the dev session cookie
      document.cookie = "dev_session=dev-session-123; path=/; max-age=31536000";
      setStatus("success");

      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      setStatus("error");
    }
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "20px",
      textAlign: "center"
    }}>
      {status === "setting" && (
        <div>
          <h1>Setting dev session...</h1>
        </div>
      )}
      {status === "success" && (
        <div>
          <h1>✓ Dev Session Set!</h1>
          <p>You're now logged in as testuser</p>
          <p>Redirecting to home...</p>
        </div>
      )}
      {status === "error" && (
        <div>
          <h1>✗ Error</h1>
          <p>Could not set cookie</p>
        </div>
      )}
    </div>
  );
}
