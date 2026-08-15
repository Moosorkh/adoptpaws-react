import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material';

// Original AdoptPaws palette, kept as a single theme.
// Type colours are sampled from the hero photo (Doggy-banner.jpg) so the
// lettering sits in the same warm-espresso family as the image.
export const colors = {
  background: '#EAE5D7',
  surface: '#ffffff',
  border: 'rgba(72, 48, 48, 0.18)',
  textPrimary: '#483030', // deepest brown in the photo
  textSecondary: '#786060', // mid warm brown from the floor
  accent: '#96BBBB',
  onAccent: '#ffffff',
};

interface ThemeContextType {
  // Kept for backward compatibility with existing call sites; the app now
  // has a single stark theme, so this is always false / a no-op.
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useMemo<Theme>(() => createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: colors.accent,
        light: '#b7d4d4',
        dark: '#7a9b9b',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#3E4E50',
        light: '#5e6e70',
        dark: '#2a3436',
        contrastText: '#ffffff',
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      error: {
        main: '#f44336',
      },
      warning: {
        main: '#ff9800',
      },
      info: {
        main: '#2196f3',
      },
      success: {
        main: '#4caf50',
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.border,
    },
    typography: {
      fontFamily: "'Space Grotesk', sans-serif",
      h1: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      button: {
        textTransform: 'uppercase',
        fontWeight: 500,
        letterSpacing: '0.05em',
      },
    },
    shape: {
      borderRadius: 0,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'all 0.25s ease',
          },
          contained: {
            '&:hover': {
              boxShadow: 'none',
            },
          },
          outlined: {
            borderColor: colors.border,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderRadius: 0,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: 'none',
            backgroundColor: colors.surface,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundColor: colors.background,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.accent,
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border,
          },
        },
      },
    },
  }), []);

  // Fixed single-theme app: no dark mode, toggle is a no-op.
  const value: ThemeContextType = {
    darkMode: false,
    toggleDarkMode: () => {},
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
