/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ServiceDesk Pro — IT Operations Control Center palette
        ops: {
          950: '#03050f',
          900: '#07091a',
          850: '#0a0e22',
          800: '#0d1226',
          750: '#111830',
          700: '#162040',
          600: '#1e2d52',
          500: '#264070',
          400: '#3b5999',
        },
        cyan: {
          glow: '#00c8ff',
          400: '#22d3ee',
          500: '#06b6d4',
        },
        neon: {
          blue: '#00c8ff',
          green: '#00ff9d',
          amber: '#ffb800',
          red: '#ff3b5c',
          purple: '#bf5fff',
        },
        // Semantic tokens mapped to CSS vars
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
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 200, 255, 0.25), 0 0 40px rgba(0, 200, 255, 0.1)',
        'glow-cyan-sm': '0 0 10px rgba(0, 200, 255, 0.3)',
        'glow-amber': '0 0 20px rgba(255, 184, 0, 0.25)',
        'glow-red': '0 0 20px rgba(255, 59, 92, 0.3)',
        'glow-green': '0 0 15px rgba(0, 255, 157, 0.2)',
        'panel': '0 4px 24px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-ops': '0 2px 12px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255,255,255,0.03) inset',
        'sidebar': '4px 0 24px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 200, 255, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 200, 255, 0.7)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-8px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backgroundImage: {
        'ops-grid': `
          linear-gradient(rgba(0, 200, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 200, 255, 0.03) 1px, transparent 1px)
        `,
        'ops-radial': 'radial-gradient(ellipse at top, rgba(0, 180, 255, 0.08) 0%, transparent 60%)',
        'sidebar-grad': 'linear-gradient(180deg, #07091a 0%, #050710 100%)',
        'card-grad': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      },
    },
  },
  plugins: [],
}
