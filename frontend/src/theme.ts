// Central theme configuration - Dark Mode
// Import this in components: import { theme } from '../theme';

export const theme = {
  // Dark Mode Colors
  colors: {
    primary: '#3b82f6',      // Bright Blue
    success: '#10b981',      // Emerald Green
    danger: '#ef4444',       // Red
    warning: '#f59e0b',      // Amber
    info: '#06b6d4',         // Cyan
    purple: '#8b5cf6',       // Purple accent

    // Backgrounds
    bg: {
      primary: '#0a0a0a',    // Main background - almost black
      secondary: '#1a1a1a',  // Secondary background
      elevated: '#2d2d2d',   // Cards, elevated surfaces
      hover: '#3a3a3a',      // Hover states
      active: '#404040',     // Active/pressed states
    },

    // Borders
    border: {
      primary: '#404040',    // Main borders
      secondary: '#2d2d2d',  // Subtle borders
      focus: '#3b82f6',      // Focus state
    },

    // Text colors
    text: {
      primary: '#e5e5e5',    // Main text
      secondary: '#a3a3a3',  // Secondary text
      tertiary: '#737373',   // Tertiary/muted text
      inverse: '#0a0a0a',    // Text on light backgrounds
    },

    // Status backgrounds
    status: {
      success: '#065f46',    // Dark green background
      error: '#7f1d1d',      // Dark red background
      warning: '#78350f',    // Dark amber background
      info: '#0c4a6e',       // Dark blue background
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '"Inter", "Helvetica Neue", Arial, sans-serif',
      monospace: 'Consolas, Monaco, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    fontWeight: {
      normal: 'normal',
      medium: '500',
      bold: 'bold',
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '30px',
    xxl: '40px',
  },

  // Border radius
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    pill: '20px',
  },

  // Shadows - Enhanced for dark mode
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.5)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)', // Blue glow
  },

  // Urgency colors for deadlines - adjusted for dark mode
  urgency: {
    urgent: '#ef4444',     // Red - 0-1 days
    soon: '#f59e0b',       // Amber - 2-3 days
    upcoming: '#06b6d4',   // Cyan - 4-7 days
    future: '#10b981',     // Green - 8+ days
  },
};

// Helper functions
export const getUrgencyColor = (daysUntil: number): string => {
  if (daysUntil <= 1) return theme.urgency.urgent;
  if (daysUntil <= 3) return theme.urgency.soon;
  if (daysUntil <= 7) return theme.urgency.upcoming;
  return theme.urgency.future;
};
