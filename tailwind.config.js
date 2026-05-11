/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./lib/**/*.{js,jsx,ts,tsx,mdx}",
    "./hooks/**/*.{js,jsx,ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-epilogue)", "Epilogue", "Segoe UI", "system-ui", "sans-serif"],
        sans: ["var(--font-lexend)", "Lexend", "Segoe UI", "system-ui", "sans-serif"],
        bali: ["Nirmala UI", "Noto Sans Balinese", "serif"]
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem"
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          dim: "hsl(var(--surface-dim))",
          variant: "hsl(var(--surface-variant))",
          lowest: "hsl(var(--surface-container-lowest))",
          low: "hsl(var(--surface-container-low))",
          container: "hsl(var(--surface-container))",
          high: "hsl(var(--surface-container-high))",
          highest: "hsl(var(--surface-container-highest))"
        },
        outline: {
          DEFAULT: "hsl(var(--outline))",
          variant: "hsl(var(--outline-variant))"
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))"
        },
        ink: "hsl(var(--foreground))",
        lontar: "hsl(var(--background))",
        sand: "hsl(var(--secondary))",
        brick: "hsl(var(--primary))",
        saffron: "hsl(var(--tertiary))",
        moss: "hsl(var(--secondary-foreground))",
        ocean: "hsl(var(--tertiary))",
        night: "hsl(var(--inverse-surface))",
        rice: "hsl(var(--surface-container-lowest))"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(42, 23, 15, 0.08)",
        line: "0 1px 0 rgba(42, 23, 15, 0.08)",
        tactile: "0 10px 30px rgba(42, 23, 15, 0.05)"
      }
    }
  },
  plugins: []
};
