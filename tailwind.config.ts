import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        line: "var(--line)",
        terracotta: "var(--terracotta)",
        "terracotta-strong": "var(--terracotta-strong)",
        teal: "var(--teal)",
        "teal-ink": "var(--teal-ink)",
        "teal-line": "var(--teal-line)",
        "teal-wash": "var(--teal-wash)",
        wash: "var(--surface-muted)",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "ui-sans-serif", "system-ui"],
        mono: ["SFMono-Regular", "ui-monospace", "Menlo"],
      },
    },
  },
  plugins: [],
};

export default config;
