import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8ff",
          100: "#dbe9ff",
          200: "#b8d4ff",
          300: "#89b7ff",
          400: "#5b94f5",
          500: "#356ed4",
          600: "#274fa3",
          700: "#1b3877",
          800: "#10234d",
          900: "#08122a"
        }
      }
    }
  },
  plugins: []
};

export default config;
