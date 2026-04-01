import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#06080F",
        panel: "#0C1324",
        accent: "#4FE3FF",
        highlight: "#6B8CFF"
      },
      boxShadow: {
        glow: "0 0 30px rgba(79, 227, 255, 0.18)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
