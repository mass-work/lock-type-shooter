import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages の Project Pages で使う場合:
// VITE_BASE_PATH=/repository-name/ npm run build
// ルート公開やカスタムドメインなら未指定のままでOK
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
});
