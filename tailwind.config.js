/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        unhas: {
          maroon: {
            DEFAULT: '#800000',
            dark: '#5c0000',
            mid: '#8b1e1e',
            light: '#9d1b16',
            soft: '#fcebea',
            hover: '#6a020a'
          },
          gold: {
            DEFAULT: '#d97706',
            light: '#f59e0b',
            soft: '#fef3c7'
          }
        },
        slate: {
          850: '#151f32',
          950: '#0b1120',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
