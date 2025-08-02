import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "browser-cat (Plugin)",
  version: "1.1",
  permissions: ["tabs"],
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content-script.tsx"],
    },
  ],
  web_accessible_resources: [
    {
      resources: ["Cat_Ginger.png", "Cat_Grey.png", "Cat_Grey_White.png"],
      matches: ["<all_urls>"],
    },
  ],
});
