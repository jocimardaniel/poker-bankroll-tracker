/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        poker: {
          bg: "#090d16",
          card: "#111827",
          border: "#1f293d",
          accent: "#10b981", // Emerald
          gold: "#f59e0b",
          red: "#ef4444",
          blue: "#3b82f6"
        }
      }
    },
  },
  plugins: [],
}
