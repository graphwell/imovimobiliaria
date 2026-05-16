import type { Config } from 'tailwindcss'

const config: Partial<Config> = {
  content: [],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EBF0FD',
          100: '#C8D5FA',
          200: '#A5BAF7',
          300: '#829FF4',
          400: '#5F84F1',
          500: '#1B4FD8',
          600: '#1440B3',
          700: '#0F3191',
          800: '#0A2270',
          900: '#05134E',
        },
        accent: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          500: '#F59E0B',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          500: '#3B82F6',
        },
      },
      fontFamily: {
        display: ['var(--font-plus-jakarta)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
