
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['-apple-system', 'Space Grotesk', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
				display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
			},
			screens: { xs: '390px' },
			colors: {
				ios: {
					blue: '#0A84FF',
					purple: '#BF5AF2',
					green: '#30D158',
					red: '#FF453A',
					orange: '#FF9F0A',
					yellow: '#FFD60A',
					teal: '#5AC8FA',
					pink: '#FF375F',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-surface': 'var(--gradient-surface)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-glass': 'var(--gradient-glass)',
			},
			boxShadow: {
				'glow-primary': 'var(--glow-primary)',
				'glow-accent': 'var(--glow-accent)',
				'glow-green': 'var(--glow-green)',
				'glow-card': 'var(--glow-card)',
				'ios': 'var(--shadow-ios)',
				'glass': '0 8px 32px 0 rgba(0,0,0,0.5)',
				'glass-strong': '0 20px 60px 0 rgba(0,0,0,0.6)',
			},
			backdropBlur: {
				'xs': '2px',
			},
			backgroundSize: {
				'size-200': '200% 200%',
				'size-300': '300% 300%',
			},
			backgroundPosition: {
				'pos-0': '0% 0%',
				'pos-right': '100% 0%',
			},
			transitionProperty: {
				'all': 'var(--transition-all)',
				'bounce': 'var(--transition-bounce)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 7s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
