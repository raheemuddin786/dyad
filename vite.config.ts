import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { RollupLog } from "rollup";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "error-handler",
      handleHotUpdate({ file, server }) {
        server.ws.send({
          type: "error",
          err: {
            message: `File changed: ${file}`,
            stack: "",
          },
        });
        return [];
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      components: path.resolve(__dirname, "./src/components"),
      "components/ui/spinner": path.resolve(
        __dirname,
        "./src/components/ui/Spinner.tsx",
      ),
      "integrations/supabase/client": path.resolve(
        __dirname,
        "./src/integrations/supabase/client.ts",
      ),
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning: RollupLog, warn) {
        if (warning.code === "UNRESOLVED_IMPORT") {
          console.error("Unresolved import:", warning.exporter || warning.id);
        }
        warn(warning);
      },
    },
  },
});
