import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roobert', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        roobert: ['Roobert', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          secondary: {
            50: "#fefef0",
            100: "#fdfdd9",
            200: "#fcfcb3",
            300: "#f7fa8c",
            400: "#f1f86e",
            500: "#ebfe90",
            600: "#c9d878",
            700: "#a7b35f",
            800: "#858e46",
            900: "#6e7535",
            DEFAULT: "#92a7e9",
            foreground: "#000000",
          }
        }
      }
    }
  })]
}; 