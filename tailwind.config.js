/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  darkMode: ["variant", "[data-theme='dark'] &"],
  content: ["./src/**/*.tsx", "./src/**/*.html"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-press": "var(--color-primary-press)",
        "primary-disabled": "var(--color-primary-disabled)",
        secondary: "var(--color-secondary)",
        "secondary-hover": "var(--color-secondary-hover)",
        "secondary-press": "var(--color-secondary-press)",
        "secondary-disabled": "var(--color-secondary-disabled)",
        surface1: "var(--color-surface1)",
        "surface1-hover": "var(--color-surface1-hover)",
        surface3: "var(--color-surface3)",
        "surface3-hover": "var(--color-surface3-hover)",
        base: "var(--color-base)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
      },
      fontFamily: {
        M_PLUS_2: ["var(--font-m-plus-2)"],
        Montserrat: ["var(--font-montserrat)"],
      },
    },
  },
  plugins: [],
};
