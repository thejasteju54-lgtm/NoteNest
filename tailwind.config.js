/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F7F7F5',
          subtle: '#F0F0ED',
          card: '#FFFFFF',
          elevated: '#FCFCFB',
        },
        slate: {
          900: '#1F2933',
          800: '#323F4B',
          700: '#475569',
          500: '#6B7280',
          400: '#9CA3AF',
          200: '#E5E7EB',
          100: '#F3F4F6',
        },
        accent: {
          sage: '#7E9C8D',
          'sage-hover': '#6B8779',
          'sage-subtle': '#EAF0ED',
          blue: '#8FA7B8',
          'blue-hover': '#7A93A4',
          'blue-subtle': '#EEF3F6',
          lavender: '#A99BC8',
          sand: '#D8CFC4',
          terracotta: '#D98A76',
          mint: '#6EB798',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 2px 6px -1px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        modal: '0 20px 35px -5px rgba(0, 0, 0, 0.12), 0 10px 15px -5px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
