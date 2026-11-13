import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        josefin: ["'Josefin Sans'", "sans-serif"],
        manrope: ["'Manrope'", "sans-serif"],
      },
      colors: {
        acasa: {
          dark: "#141414",
          charcoal: "#262626",
          gray: "#555555",
          lightGray: "#F5F5F7",
          border: "#E5E5E5",
          accent: "#2A2A2A",
          gold: "#C5A880",
        },
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
