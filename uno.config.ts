import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  presets: [presetWind4()],
  content: {
    pipeline: {
      include: ["src/**/*.{ts,tsx,js,jsx,mdx}", "components/**/*.{ts,tsx,js,jsx,mdx}"],
    },
  },
});
