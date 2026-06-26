/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#1A1A1A",
          50: "#f5f5f5",
          100: "#e6e6e6",
          600: "#4a4a4a",
          700: "#2e2e2e",
          800: "#1f1f1f",
          900: "#141414",
        },
        gold: {
          DEFAULT: "#B8924A",
          light: "#C9A55C",
          soft: "#E8DCC4",
          50: "#FBF8F1",
          100: "#F3EAD7",
        },
        cloud: "#F7F7F5",
        mist: "#EFEFEC",
      },
      fontFamily: {
        // Booking.com-style single sans family across the whole UI.
        // (Booking Sans is proprietary; Mulish is the closest free match.)
        // Both slots point to it so headings and body share one typeface.
        sans: ['"Mulish"', "system-ui", "sans-serif"],
        serif: ['"Mulish"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(26, 26, 26, 0.12)",
        card: "0 6px 30px -10px rgba(26, 26, 26, 0.15)",
        gold: "0 12px 40px -12px rgba(184, 146, 74, 0.35)",
        lift: "0 24px 60px -20px rgba(26, 26, 26, 0.25)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      letterSpacing: {
        luxe: "0.25em",
        tightest: "-0.03em",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out both",
        shimmer: "shimmer 1.8s linear infinite",
        kenburns: "kenburns 18s ease-out forwards",
        floaty: "floaty 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
