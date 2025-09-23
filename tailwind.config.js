/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}",'./app/**/*.tsx','./component/**/*.tsx', './Items/**/*.tsx','./<custom directory>/**/*.{js,jsx,ts,tsx}'
  ],
  
  theme: {
    extend: {},
  },
  plugins: [],
}