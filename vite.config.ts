import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    cloudflare({
      persistState: process.env.INTERVIEW_STATE_DIR
        ? { path: process.env.INTERVIEW_STATE_DIR }
        : true,
    }),
  ],
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  resolve: {
    alias: Object.fromEntries(
      ["client", "server", "shared"].map((name) => [
        `@${name}`,
        fileURLToPath(new URL(`./src/${name}`, import.meta.url)),
      ]),
    ),
  },
});
