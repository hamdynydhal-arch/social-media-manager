import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
        latin: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Royal Navy palette — extracted from logo
        navy: {
          950: "#070D18",
          900: "#0D1828",
          800: "#132039",
          700: "#1B2D50",
          600: "#243563",
          500: "#2E4280",
        },
        // Metallic Gold palette — extracted from logo
        gold: {
          DEFAULT: "#C9A430",
          light: "#E8C87A",
          dark: "#8B6914",
          muted: "#C9A43015",
          bright: "#F0D060",
        },
        // Silver circuit accent
        silver: {
          DEFAULT: "#6B8CAE",
          light: "#9DB5CC",
          dark: "#4A6480",
        },
        profit: {
          DEFAULT: "#22c55e",
          muted: "#16a34a",
          bg: "rgba(34, 197, 94, 0.1)",
        },
        loss: {
          DEFAULT: "#ef4444",
          muted: "#dc2626",
          bg: "rgba(239, 68, 68, 0.1)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 8px #C9A430, 0 0 16px #C9A430" },
          "50%": { boxShadow: "0 0 24px #C9A430, 0 0 48px #C9A43066" },
        },
        shimmerGold: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "shimmer-gold": "shimmerGold 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
