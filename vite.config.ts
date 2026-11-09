// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [VitePWA({
      strategies: "generateSW",
      filename: "sw.js",
      manifest: false,
      injectRegister: null,
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      // Generate into the client build before Nitro copies it to the deployment's public tree.
      integration: {
        configureOptions(config, options) {
          options.outDir = config.environments?.client?.build.outDir ?? "dist/client";
        },
      },
      workbox: {
        globPatterns: ["**/*.{js,css,png,svg,woff,woff2}", "manifest.json"],
        globIgnores: ["**/server/**", "**/*.map"],
        // TanStack serves HTML dynamically. Cache visited public pages, not private admin HTML.
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, url, sameOrigin }) => sameOrigin && request.mode === "navigate" && !/^\/(?:~oauth|api|admin)(?:\/|$)/.test(url.pathname),
            handler: "NetworkFirst",
            options: { cacheName: "nosuk-public-pages", networkTimeoutSeconds: 5, cacheableResponse: { statuses: [200] }, expiration: { maxEntries: 10, maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /^\/assets\/.*[-.][a-zA-Z0-9_-]{8,}\.(?:js|css|woff2?)$/.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "nosuk-hashed-assets", cacheableResponse: { statuses: [200] }, expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
          },
        ],
      },
    })],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
