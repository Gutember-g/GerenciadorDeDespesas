/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        themeBg: "var(--color-bg)",
        themeSurface: "var(--color-surface)",
        themeModal: "var(--color-modal)",
        themeBorder: "var(--color-border)",
        themeText: "var(--color-text-primary)",
        themeTextSecondary: "var(--color-text-secondary)",

        darkBg: "#0f172a", // slate-900
        cardBg: "rgba(30, 41, 59, 0.7)", // slate-800 with glassmorphism
        accent: "#3b82f6", // blue-500
        success: "#10b981", // emerald-500
        warning: "#f59e0b", // amber-500
        danger: "#ef4444", // red-500
      }
    },
  },
  plugins: [],
}
