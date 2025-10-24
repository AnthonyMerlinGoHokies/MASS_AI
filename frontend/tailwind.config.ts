
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
			colors: {
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Brand Color Palette - Exact colors from logo
				'ai-gradient': '#7F6FEA',        // Main gradient color - primary brand
				'ai-white': '#ffffff',           // Pure white
				'ai-black': '#000000',           // Pure black
				'ai-light-purple': '#a79bf0',    // Light purple accent
				'ai-dark-purple': '#5742e3',     // Darker purple - main CTAs
				'ai-light-gray': '#e6e6e6',      // Light gray for borders/backgrounds
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'space-grotesk': ['Space Grotesk', 'sans-serif'],
				'jetbrains': ['JetBrains Mono', 'monospace'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slide-in-left': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.8)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'counter-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-in-bottom': {
					'0%': {
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'flicker-outer': {
					'0%, 100%': {
						transform: 'scale(1) translateY(0)',
						opacity: '0.9'
					},
					'25%': {
						transform: 'scale(1.02) translateY(-2px)',
						opacity: '0.95'
					},
					'50%': {
						transform: 'scale(0.98) translateY(1px)',
						opacity: '0.85'
					},
					'75%': {
						transform: 'scale(1.01) translateY(-1px)',
						opacity: '0.92'
					}
				},
				'flicker-middle': {
					'0%, 100%': {
						transform: 'scale(1) translateY(0)',
						opacity: '0.85'
					},
					'20%': {
						transform: 'scale(1.03) translateY(-3px)',
						opacity: '0.9'
					},
					'60%': {
						transform: 'scale(0.97) translateY(2px)',
						opacity: '0.8'
					},
					'80%': {
						transform: 'scale(1.02) translateY(-1px)',
						opacity: '0.87'
					}
				},
				'flicker-inner': {
					'0%, 100%': {
						transform: 'scale(1) translateY(0)',
						opacity: '0.95'
					},
					'30%': {
						transform: 'scale(1.05) translateY(-4px)',
						opacity: '1'
					},
					'70%': {
						transform: 'scale(0.95) translateY(2px)',
						opacity: '0.9'
					}
				},
				'flicker-glow': {
					'0%, 100%': {
						opacity: '0.7',
						transform: 'scale(1.5)'
					},
					'50%': {
						opacity: '0.5',
						transform: 'scale(1.6)'
					}
				},
				'sparkle-1': {
					'0%, 100%': {
						opacity: '0',
						transform: 'translateY(0) scale(0)'
					},
					'50%': {
						opacity: '1',
						transform: 'translateY(-8px) scale(1)'
					}
				},
				'sparkle-2': {
					'0%, 100%': {
						opacity: '0',
						transform: 'translateY(0) scale(0)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'translateY(-6px) scale(1)'
					}
				},
				'sparkle-3': {
					'0%, 100%': {
						opacity: '0',
						transform: 'translateY(0) scale(0)'
					},
					'50%': {
						opacity: '0.6',
						transform: 'translateY(-5px) scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.7s ease-out forwards',
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
				'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
				'scale-in': 'scale-in 0.5s ease-out forwards',
				'counter-up': 'counter-up 0.8s ease-out forwards',
				'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
				'flicker-outer': 'flicker-outer 3s ease-in-out infinite',
				'flicker-middle': 'flicker-middle 2.5s ease-in-out infinite',
				'flicker-inner': 'flicker-inner 2s ease-in-out infinite',
				'flicker-glow': 'flicker-glow 3s ease-in-out infinite',
				'sparkle-1': 'sparkle-1 2s ease-in-out infinite',
				'sparkle-2': 'sparkle-2 2.3s ease-in-out infinite 0.5s',
				'sparkle-3': 'sparkle-3 1.8s ease-in-out infinite 1s'
			},
			boxShadow: {
				'3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
