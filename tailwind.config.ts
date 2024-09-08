import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        // "rat": "url('/bg.png')",
      },
    },
    fontFamily: {
      PPMondwest: ['PPMondwest-Regular', 'sans-serif'],
      PPNeueBit: ['PPNeueBit-Bold', 'sans-serif'],
    },
    colors: {
      textGray: "#333333",
      lilac: {
        light: "#E0BBE4",  // Light Lilac
        DEFAULT: "#D8BFD8", // Default Lilac
        dark: "#B08BA6",    // Darker Lilac for accents
      },
      black: "#000",
      white: "#fff",
      brand: {
        blue: "#4A90E2",
        bluedark: "#3E4E8C",
        neongreen: "#66FF99",
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
export default config;