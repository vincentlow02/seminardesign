import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design Tokens
        brand: {
          primary: "#0f172a",   // Slate 900
          secondary: "#64748b", // Slate 500
          accent: "#3b82f6",    // Blue 500
        },
        surface: {
          lowest: "#ffffff",
          low: "#f8fafc",
        }
      },
      spacing: {
        // We use a 4px (0.25rem) base scale
        'xs': '0.5rem',  // 8px
        'sm': '1rem',    // 16px
        'md': '1.5rem',  // 24px
        'lg': '2rem',    // 32px
      },
    },
  },
  plugins: [],
};
export default config;
