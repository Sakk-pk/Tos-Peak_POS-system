import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            // ── TOS-PEAK v2.0 Redesigned Typefaces ─────────────────────────
            fontFamily: {
                display: ['Syne', ...defaultTheme.fontFamily.sans],
                sans:    ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
                mono:    ['DM Mono', ...defaultTheme.fontFamily.mono],
            },

            // ── Refined Color System ───
            colors: {
                background:        'oklch(var(--background) / <alpha-value>)',
                foreground:        'oklch(var(--foreground) / <alpha-value>)',
                card: {
                    DEFAULT:       'oklch(var(--card) / <alpha-value>)',
                    foreground:    'oklch(var(--card-foreground) / <alpha-value>)',
                },
                primary: {
                    DEFAULT:       'oklch(var(--primary) / <alpha-value>)',
                    foreground:    'oklch(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT:       'oklch(var(--secondary) / <alpha-value>)',
                    foreground:    'oklch(var(--secondary-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT:       'oklch(var(--muted) / <alpha-value>)',
                    foreground:    'oklch(var(--muted-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT:       'oklch(var(--accent) / <alpha-value>)',
                    foreground:    'oklch(var(--accent-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT:       'oklch(var(--destructive) / <alpha-value>)',
                    foreground:    'oklch(var(--destructive-foreground) / <alpha-value>)',
                },
                success: {
                    DEFAULT:       'oklch(var(--success) / <alpha-value>)',
                    foreground:    'oklch(var(--success-foreground) / <alpha-value>)',
                },
                border:            'oklch(var(--border) / <alpha-value>)',
                input:             'oklch(var(--input) / <alpha-value>)',
                ring:              'oklch(var(--ring) / <alpha-value>)',
                sidebar: {
                    DEFAULT:       'oklch(var(--sidebar) / <alpha-value>)',
                    foreground:    'oklch(var(--sidebar-foreground) / <alpha-value>)',
                    primary:       'oklch(var(--sidebar-primary) / <alpha-value>)',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground) / <alpha-value>)',
                    accent:        'oklch(var(--sidebar-accent) / <alpha-value>)',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground) / <alpha-value>)',
                    border:        'oklch(var(--sidebar-border) / <alpha-value>)',
                    ring:          'oklch(var(--sidebar-ring) / <alpha-value>)',
                },
            },

            // ── Border Radius derived from --radius (8px base for v2.0 cards) ──
            borderRadius: {
                none: '0',
                sm:   'calc(var(--radius) - 4px)',   // 4px
                DEFAULT: 'var(--radius)',              // 8px
                md:   'calc(var(--radius) + 2px)',    // 10px
                lg:   'calc(var(--radius) + 4px)',    // 12px
                xl:   'calc(var(--radius) + 8px)',    // 16px
                '2xl':'calc(var(--radius) + 16px)',   // 24px
                full: '9999px',
            },

            // ── Animations ────────────────────────────────────────────────
            keyframes: {
                'slide-up': {
                    '0%':   { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%':   { opacity: '0', transform: 'scale(0.96)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            animation: {
                'slide-up':  'slide-up 450ms cubic-bezier(0.16,1,0.3,1) both',
                'scale-in':  'scale-in 350ms cubic-bezier(0.16,1,0.3,1) both',
            },

            // ── Easing ────────────────────────────────────────────────────
            transitionTimingFunction: {
                'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },

    plugins: [forms],
};
