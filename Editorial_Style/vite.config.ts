import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      // Use the local SSR error wrapper instead of Start's default server entry.
      server: { entry: "server" },
    }),
    nitro({ preset: "vercel" }),
    viteReact(),
    tailwindcss(),
  ],
});
