/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
    },
  },
  safelist: [
    // NOTE: Currently the plugin only extracts classes from safelist
    // Utility generation from theme is not yet implemented
    'flex',
    'items-center',
    'justify-between',
    'gap-4',
    'bg-blue-500',
    'text-brand-500',
    'text-white',
    'p-4',
    'rounded',
  ],
  plugins: [
    // Sample plugin that adds custom 3D transform utilities
    function ({ addUtilities }) {
      addUtilities({
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
        '.rotate-x-180': {
          transform: 'rotateX(180deg)',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.backface-visible': {
          backfaceVisibility: 'visible',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
      })
    },
  ],
}
