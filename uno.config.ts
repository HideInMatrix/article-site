import { defineConfig, presetWind4 } from "unocss";
import presetAnimations from "unocss-preset-animations";
import { presetShadcn } from "unocss-preset-shadcn";

const animationsPreset = presetAnimations() as unknown as ReturnType<typeof presetWind4>;
const shadcnPreset = presetShadcn(
  {
    color: "neutral",
    darkSelector: ".dark",
  },
  {
    globals: false,
    componentLibrary: "radix",
  }
) as unknown as ReturnType<typeof presetWind4>;

export default defineConfig({
  presets: [presetWind4(), animationsPreset, shadcnPreset],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        "src/**/*.{js,jsx,ts,tsx,mdx}",
        "components/**/*.{js,jsx,ts,tsx,mdx}",
      ],
    },
  },
});
