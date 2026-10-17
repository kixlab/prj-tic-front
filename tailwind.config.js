/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F8F4',
          100: '#E0EFE8',
          200: '#C1E9D6',
          300: '#8FD7B4',
          400: '#69CC9E',
          500: '#5EBB8F', // 메인 브랜드 그린
          600: '#4FA47C',
          700: '#3D8562',
          800: '#2E664B',
          900: '#1F4734',
        },
        medical: {
          bg: '#F4F4F4',
          surface: '#FFFFFF',
          dark: '#192835',
          subtext: '#6A6A6A',
          caption: '#898989',
          border: '#E3E2DF',
          danger: '#F14B2E',
        }
      },
    },
  },
  plugins: [],
}
