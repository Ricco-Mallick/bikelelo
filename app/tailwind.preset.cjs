/**
 * Unified Tailwind CSS Preset for Web Dev Assets
 * Compatible with Tailwind CSS v3 and v4 projects.
 * 
 * Usage in tailwind.config.js:
 *   module.exports = {
 *     presets: [require('./config/tailwind.preset.js')],
 *     ...
 *   }
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0f0f10",
          secondary: "#161618",
          tertiary: "#1f1f22"
        },
        muted: {
          DEFAULT: "#8c8d92",
          dark: "#57565f"
        }
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"]
      },
      keyframes: {
        "trusted-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        shimmer: {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shimmer-width, 100px)) 0"
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shimmer-width, 100px)) 0"
          }
        },
        "glow-pulse": {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.6, transform: "scale(1.05)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: 1 },
          "100%": { transform: "scale(2.2)", opacity: 0 }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "trusted-marquee": "trusted-marquee 36s linear infinite",
        shimmer: "shimmer 8s infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        ripple: "ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: []
};
