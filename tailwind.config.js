
export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chat: {
          header: '#334155',
          bg: '#F8FAFC',
          area: '#F1F5F9',
          card: '#FFFFFF',
          accent: '#0EA5E9',
          text: '#1E293B',
          muted: '#94A3B8',
          border: '#CBD5E1',
          online: '#22C55E',
          sent: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
