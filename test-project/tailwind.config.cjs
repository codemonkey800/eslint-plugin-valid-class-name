/** @type {import('tailwindcss').Config} */
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
  plugins: [],
}
