export const COLOR_MAP = {
    black: '#111111',
    white: '#ffffff',
    red: '#ef4444',
    pink: '#ec4899',
    hotpink: '#ff69b4',
    lightpink: '#ffb6c1',
    rose: '#f43f5e',
    blue: '#2563eb',
    darkblue: '#1e3a8a',
    navy: '#0f172a',
    lightblue: '#60a5fa',
    sky: '#0284c7',
    cyan: '#06b6d4',
    green: '#22c55e',
    darkgreen: '#14532d',
    lightgreen: '#86efac',
    emerald: '#10b981',
    lime: '#84cc16',
    yellow: '#facc15',
    amber: '#f59e0b',
    orange: '#f97316',
    purple: '#a855f7',
    violet: '#7c3aed',
    indigo: '#6366f1',
    grey: '#6b7280',
    gray: '#6b7280',
    lightgrey: '#d1d5db',
    lightgray: '#d1d5db',
    darkgrey: '#374151',
    darkgray: '#374151',
    brown: '#78350f',
    tan: '#d2b48c',
    beige: '#f5f5dc',
    gold: '#eab308',
    silver: '#cbd5e1',
    teal: '#14b8a6',
    maroon: '#800000',
    burgundy: '#800020',
    magenta: '#d946ef',
    coral: '#ff7f50',
    turquoise: '#40e0d0',
    lavender: '#e9d5ff',
    peach: '#ffdab9',
    mint: '#a7f3d0',
};

export function getAccurateColorHex(name = '', value = '') {
    const key = String(name || '').trim().toLowerCase().replace(/[^a-z]/g, '');
    if (key && COLOR_MAP[key]) {
        return COLOR_MAP[key];
    }
    for (const [colorKey, hex] of Object.entries(COLOR_MAP)) {
        if (key.includes(colorKey)) {
            return hex;
        }
    }
    if (value && /^#([0-9a-fA-F]{3,8})$/.test(value)) {
        return value;
    }
    return value || '#111111';
}
