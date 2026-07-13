/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
        heading: ['var(--font-quicksand)', 'sans-serif'],
      },
      colors: {
        darkBg: "#05080f",
        darkCard: "#090f1a",
      }
    },
  },
  plugins: [],
}
