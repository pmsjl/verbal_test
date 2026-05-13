import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#4f46e5",
      },
      animation: {
        "flash-correct": "flashGreen 200ms ease-out",
        "flash-wrong": "flashRed 200ms ease-out",
        "fade-in": "fadeIn 400ms ease-out",
        "scale-in": "scaleIn 350ms ease-out",
        "pulse-once": "pulseOnce 500ms ease-in-out",
        "bounce-in": "bounceIn 500ms ease-out",
      },
      keyframes: {
        flashGreen: {
          "0%": { backgroundColor: "#d4f4d4" },
          "100%": { backgroundColor: "transparent" },
        },
        flashRed: {
          "0%": { backgroundColor: "#f4d4d4" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
