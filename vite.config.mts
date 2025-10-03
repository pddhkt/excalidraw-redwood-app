import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces (allows Tailscale access)
    port: 5173,
  },
});
