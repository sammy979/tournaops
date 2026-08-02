/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00ffff",
          purple: "#a855f7",
          pink: "#ec4899",
          green: "#10b981",
          blue: "#3b82f6",
        }
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "victory": "victory 0.6s ease-out",
        "line-draw": "line-draw 1s ease-out forwards",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(168, 85, 247, 0.7)" }
        },
        "victory": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)", boxShadow: "0 0 60px rgba(16, 185, 129, 0.8)" },
          "100%": { transform: "scale(1)" }
        },
        "line-draw": {
          from: { strokeDashoffset: "100" },
          to: { strokeDashoffset: "0" }
        }
      },
      fontFamily: {
        display: ["Rajdhani", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};