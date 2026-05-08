import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0d1f2d",
          2: "#132333",
          3: "#1a2e42",
        },
        teal: "#1b4f6a",
        amber: {
          DEFAULT: "#f5ab20",
          2: "#e8941a",
          soft: "#fff3dc",
        },
        muted: "#8ca5bc",
        "off-white": "#e8f0f7",
        "text-blue": "#cde0f0",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        dm: ["var(--font-dm)", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "slide-left": "slideLeft 0.6s ease forwards",
        "scale-in": "scaleIn 0.25s ease forwards",
        pulse2: "pulse2 1.8s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.93)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulse2: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(245,166,35,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,166,35,.04) 1px,transparent 1px)",
      },
      backgroundSize: {
        "grid-64": "64px 64px",
      },
    },
  },
  plugins: [],
};

export default config;
