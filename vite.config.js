import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Lu depuis .env.local, qui n'est pas versionné. Le token reste côté serveur
  // de dev : il est ajouté ici et n'apparaît jamais dans le code du navigateur.
  const { EWGF_TOKEN } = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Wavu Wank ne sert que la page joueur sans paramètre : les variantes
        // ?before= et ?limit= sont derrière un défi Cloudflare.
        "/api/wavu": {
          target: "https://wank.wavu.wiki",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/wavu/, ""),
        },
        "/api/ewgf": {
          target: "https://api.ewgf.gg",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ewgf/, "/external"),
          headers: EWGF_TOKEN ? { Authorization: `Bearer ${EWGF_TOKEN}` } : {},
        },
      },
    },
  };
});
