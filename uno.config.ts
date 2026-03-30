import { defineConfig, presetAttributify, presetIcons, presetWind4 } from "unocss";
import presetAnimations from "unocss-preset-animations";
import { presetShadcn } from "unocss-preset-shadcn";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "media",
    }),
    presetAnimations(),
    presetShadcn(
      {
        color: "green",
      },
      {
        componentLibrary: "radix",
      }
    ),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
});
