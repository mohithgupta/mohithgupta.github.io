import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://mohithgupta.github.io",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  build: { inlineStylesheets: "auto" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
});
