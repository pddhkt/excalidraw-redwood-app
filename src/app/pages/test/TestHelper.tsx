import type { AppContext } from "@/worker";
import { createTestSession, clearTestSession } from "./functions";

export default async function TestHelper({ ctx }: { ctx: AppContext }) {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Test Helper Page</h1>
      <p>⚠️ Only available in development mode</p>

      <div style={{ marginTop: "20px" }}>
        <h2>Session Status</h2>
        {ctx.user ? (
          <div>
            <p>✅ Logged in as: {ctx.user.username}</p>
            <p>User ID: {ctx.user.id}</p>
            <p>Tier: {ctx.user.tier}</p>
          </div>
        ) : (
          <p>❌ Not logged in</p>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Test Actions</h2>
        <form action={createTestSession} method="post">
          <button type="submit" style={{ padding: "10px", marginRight: "10px" }}>
            Create Test Session
          </button>
        </form>
        <form action={clearTestSession} method="post">
          <button type="submit" style={{ padding: "10px" }}>
            Clear Session
          </button>
        </form>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Protected Route Test</h2>
        <a href="/" style={{ color: "blue", textDecoration: "underline" }}>
          Go to Home (Protected)
        </a>
      </div>
    </div>
  );
}