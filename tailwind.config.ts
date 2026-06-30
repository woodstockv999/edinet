import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper:  { DEFAULT: "#F8F5F0", surface: "#FFFFFF", border: "#E7E2D8", dark: "#EDEAD3" },
        ink:    { DEFAULT: "#1C1917", mid: "#44403C", muted: "#78716C", faint: "#B4AFA9" },
        accent: { DEFAULT: "#C62828", hover: "#AD1F1F", soft: "#FDF0F0", border: "#FECACA" },
        navy:   { DEFAULT: "#0D1B2A", mid: "#1E3A5F", muted: "#4A6FA5", surface: "#162032" },
        pos:    { DEFAULT: "#15803D", soft: "#F0FDF4" },
        neg:    { DEFAULT: "#C62828", soft: "#FDF0F0" },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Hiragino Kaku Gothic ProN"', '"Hiragino Sans"', '"Yu Gothic UI"', '"Meiryo"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
