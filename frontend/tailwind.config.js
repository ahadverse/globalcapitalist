/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#475569',
        accent: '#d97706',
        light: '#f8fafc',
        dark: '#1e293b',
      },
    },
  },
  plugins: [],
};
