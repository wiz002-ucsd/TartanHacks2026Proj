// Central theme configuration
// Import this in components: import { theme } from '../theme';

export const theme = {
  // Colors
  colors: {
    primary: '#007bff',      // Blue
    success: '#28a745',      // Green
    danger: '#dc3545',       // Red
    warning: '#ffc107',      // Yellow
    info: '#17a2b8',         // Cyan
    dark: '#343a40',         // Dark gray
    light: '#f8f9fa',        // Light gray
    border: '#dee2e6',       // Border gray
    text: {
      primary: '#343a40',
      secondary: '#6c757d',
      light: '#155724',
      dark: '#721c24',
    },
    background: {
      success: '#d4edda',
      error: '#f8d7da',
      light: '#f8f9fa',
      white: '#ffffff',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      monospace: 'Monaco, Courier, monospace',
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

  // Shadows
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 12px rgba(0,0,0,0.15)',
    lg: '0 8px 24px rgba(0,0,0,0.2)',
  },

  // Urgency colors for deadlines
  urgency: {
    urgent: '#dc3545',    // Red - 0-1 days
    soon: '#ffc107',      // Yellow - 2-3 days
    upcoming: '#17a2b8',  // Blue - 4-7 days
    future: '#28a745',    // Green - 8+ days
  },
};

// Helper functions
export const getUrgencyColor = (daysUntil: number): string => {
  if (daysUntil <= 1) return theme.urgency.urgent;
  if (daysUntil <= 3) return theme.urgency.soon;
  if (daysUntil <= 7) return theme.urgency.upcoming;
  return theme.urgency.future;
};
