// Central theme configuration - Sunzi Theme (Art of War)
// "Modern yet Academic" — Crimson Pro serif headings, refined dark palette
// Import this in components: import { theme } from '../theme';

export const theme = {
  // Sunzi Brand Colors — warm, authoritative, academic
  colors: {
    primary:   '#E67E22',   // Sunzi Orange — main brand color
    secondary: '#F59E0B',   // Warm amber accent
    gold:      '#D4A853',   // Academic gold (used for subtle accents)
    success:   '#10b981',   // Emerald green
    danger:    '#ef4444',   // Red
    warning:   '#f59e0b',   // Amber
    info:      '#06b6d4',   // Cyan
    purple:    '#8b5cf6',   // Purple accent

    // Backgrounds — very dark, warm-tinted black
    bg: {
      primary:  '#000000',  // Pure black
      secondary: '#050505', // Near-black
      elevated:  '#0a0a0a', // Card surfaces
      card:      '#111111', // Elevated cards
      hover:     '#161616', // Hover states
      glass:     'rgba(255, 255, 255, 0.03)', // Glass surface
    },

    // Borders — subtle warm tones
    border: {
      primary:   'rgba(255, 255, 255, 0.07)',  // Main borders
      secondary: 'rgba(255, 255, 255, 0.04)',  // Subtle borders
      accent:    'rgba(230, 126, 34, 0.2)',    // Orange-tinted borders
      focus:     '#E67E22',                    // Focus ring
    },

    // Text — warm off-white for legibility
    text: {
      primary:   '#F0EDE8',  // Warm off-white (not cold gray)
      secondary: '#9A9490',  // Warm medium gray
      tertiary:  '#5A5652',  // Muted warm gray
      inverse:   '#0A0A0A',  // Text on light backgrounds
    },

    // Status backgrounds
    status: {
      success: '#065f46',
      error:   '#7f1d1d',
      warning: '#78350f',
      info:    '#0c4a6e',
    },
  },

  // Typography — Crimson Pro for display/headings, Inter for body
  typography: {
    fontFamily: {
      display:   '"Crimson Pro", Georgia, "Times New Roman", serif',
      primary:   '"Inter", "Helvetica Neue", Arial, sans-serif',
      monospace: 'Consolas, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs:    '12px',
      sm:    '14px',
      base:  '16px',
      lg:    '18px',
      xl:    '24px',
      xxl:   '32px',
      xxxl:  '48px',
      hero:  '72px',
    },
    lineHeight: {
      tight:   '1.1',
      snug:    '1.3',
      normal:  '1.6',
      relaxed: '1.75',
    },
  },

  // Spacing
  spacing: {
    xs:  '4px',
    sm:  '8px',
    md:  '12px',
    lg:  '20px',
    xl:  '32px',
    xxl: '48px',
  },

  // Border radius
  borderRadius: {
    sm:  '6px',
    md:  '10px',
    lg:  '16px',
    xl:  '20px',
    xxl: '28px',
    pill: '999px',
  },

  // Shadows — warm, orange-tinted for brand elements
  shadows: {
    sm:         '0 2px 8px rgba(0,0,0,0.5)',
    md:         '0 4px 16px rgba(0,0,0,0.6)',
    lg:         '0 8px 32px rgba(0,0,0,0.7)',
    glow:       '0 0 24px rgba(230, 126, 34, 0.3)',
    glowStrong: '0 0 40px rgba(230, 126, 34, 0.5)',
    card:       '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
  },

  // Urgency colors for deadlines
  urgency: {
    urgent:   '#ef4444',  // Red  — 0–1 days
    soon:     '#f59e0b',  // Amber — 2–3 days
    upcoming: '#06b6d4',  // Cyan  — 4–7 days
    future:   '#10b981',  // Green — 8+ days
  },

  // Animation tokens
  animation: {
    fast:   '150ms',
    normal: '250ms',
    slow:   '400ms',
    easeOut:    'cubic-bezier(0.22, 1, 0.36, 1)',
    easeInOut:  'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Helper functions
export const getUrgencyColor = (daysUntil: number): string => {
  if (daysUntil <= 1) return theme.urgency.urgent;
  if (daysUntil <= 3) return theme.urgency.soon;
  if (daysUntil <= 7) return theme.urgency.upcoming;
  return theme.urgency.future;
};
