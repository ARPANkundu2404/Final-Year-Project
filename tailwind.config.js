/**
 * tailwind.config.js
 * "2026 Aesthetic" — Pearl (light) + Midnight Jewel (dark)
 *
 * Key design decisions:
 * - CSS custom properties bridge Tailwind ↔ CSS variables
 *   so Framer Motion inline styles can read them too
 * - `darkMode: 'class'` allows next-themes to control via
 *   the <html class="dark"> toggle (zero-flicker approach)
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",      // Controlled by next-themes → <html class="dark">

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // ── Brand color palette ─────────────────────────────────────────────
      colors: {
        // ── Pearl / Light Mode ────────────────────────────────────────────
        pearl: {
          50:  "#FAFCFF",
          100: "#F8FAFC",   // Background
          200: "#EEF2F8",   // Surface hover
          300: "#E2E8F0",   // Border
          400: "#CBD5E1",   // Muted border
          500: "#94A3B8",   // Muted text / occupied
          600: "#64748B",   // Secondary text
          700: "#475569",
          800: "#334155",
          900: "#1E293B",
        },

        // ── Midnight Jewel / Dark Mode ────────────────────────────────────
        midnight: {
          50:  "#1E293B",
          100: "#162032",
          200: "#0F172A",   // Background (Deep Space Indigo)
          300: "#0B1120",
          400: "#080D1A",
        },

        // ── Ink — primary text in both modes ─────────────────────────────
        ink: {
          light: "#1E1B4B", // Deep Charcoal Indigo (light mode text)
          dark:  "#F1F5F9", // Soft Silver (dark mode text)
        },

        // ── Available slot / CTA ──────────────────────────────────────────
        emerald: {
          // Light: vibrant emerald
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          // Dark: neon mint variant
          neon: "#2DD4BF",
        },

        // ── Indigo accent (brand) ─────────────────────────────────────────
        indigo: {
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },

        // ── Occupied / error ──────────────────────────────────────────────
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
          slate: {
            light: "#94A3B8",  // Muted rose-slate (light occupied)
            dark:  "#475569",  // Dim crimson slate (dark occupied)
          },
        },

        // ── Warning / recommended ─────────────────────────────────────────
        amber: {
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
        },

        // ── Glass surfaces ────────────────────────────────────────────────
        glass: {
          light: "rgba(255, 255, 255, 0.72)",
          dark:  "rgba(30, 41, 59, 0.70)",
        },
      },

      // ── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },

      // ── Border radius ───────────────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Backdrop blur ───────────────────────────────────────────────────
      backdropBlur: {
        xs:   "2px",
        sm:   "6px",
        md:   "12px",
        lg:   "20px",
        xl:   "28px",
        "2xl":"40px",
      },

      // ── Box shadows ─────────────────────────────────────────────────────
      boxShadow: {
        // Light mode card shadows
        "pearl-sm":  "0 1px 4px rgba(30,27,75,0.06), 0 2px 8px rgba(30,27,75,0.04)",
        "pearl-md":  "0 4px 16px rgba(30,27,75,0.10), 0 2px 6px rgba(30,27,75,0.06)",
        "pearl-lg":  "0 8px 32px rgba(30,27,75,0.14), 0 2px 8px rgba(30,27,75,0.08)",

        // Dark mode glow shadows
        "glow-emerald": "0 0 24px rgba(45,212,191,0.20), 0 0 8px rgba(45,212,191,0.12)",
        "glow-indigo":  "0 0 24px rgba(99,102,241,0.25), 0 0 8px rgba(99,102,241,0.15)",
        "glow-amber":   "0 0 16px rgba(251,191,36,0.25)",

        // Sheet / modal elevation
        "sheet-light": "0 -8px 40px rgba(30,27,75,0.12), 0 -2px 12px rgba(30,27,75,0.06)",
        "sheet-dark":  "0 -8px 40px rgba(0,0,0,0.5), 0 -2px 12px rgba(0,0,0,0.3)",
      },

      // ── Animations ──────────────────────────────────────────────────────
      animation: {
        "pulse-slow":    "pulse 3s ease-in-out infinite",
        "glow-pulse":    "glowPulse 2.5s ease-in-out infinite",
        "mesh-drift":    "meshDrift 12s ease-in-out infinite alternate",
        "spin-slow":     "spin 3s linear infinite",
      },

      keyframes: {
        glowPulse: {
          "0%,100%": { opacity: "0.5" },
          "50%":     { opacity: "1" },
        },
        meshDrift: {
          "0%":   { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },

      // ── Transitions ─────────────────────────────────────────────────────
      transitionDuration: {
        300: "300ms",
        400: "400ms",
        500: "500ms",
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },

  plugins: [],
};