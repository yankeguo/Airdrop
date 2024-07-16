import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  plugins: [require("@tailwindcss/typography")],
  content: ["docs/content/**/*.md"],
  theme: {
    fontFamily: {
      sans: [
        "ui-sans-serif",
        '"DM Sans"',
        "system-ui",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: [
        "ui-serif",
        '"DM Serif Display"',
        "Georgia",
        "Cambria",
        '"Times New Roman"',
        "Times",
        "serif",
      ],
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        '"Liberation Mono"',
        '"Courier New"',
        "monospace",
      ],
    },
  },
};
