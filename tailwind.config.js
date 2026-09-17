/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/admin/**/*.{ts,tsx}',
    './src/pages/admin/**/*.{ts,tsx}',
    './src/admin/components/ui/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', '"Source Serif Pro"', '"Noto Serif SC"', 'Georgia', 'serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        paper: {
          50:  '#fbf8f3',
          100: '#f5efe4',
          200: '#ebe3d1',
          300: '#d9cdb1',
          400: '#b8a682',
          500: '#8c7b5c',
          600: '#655543',
          700: '#463a2c',
          800: '#2d2519',
          900: '#1a160f',
        },
        ink: {
          DEFAULT: '#2d2519',
          soft: '#463a2c',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
            fontFamily: 'var(--tw-font-serif)',
            lineHeight: '1.75',
            fontSize: '1.0625rem',
            color: 'hsl(var(--foreground))',
          },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};