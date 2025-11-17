import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material';

interface ThemeContextType {
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
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    const handleDarkModeChange = (e: CustomEvent<boolean>) => {
      setDarkMode(e.detail);
    };

    window.addEventListener('darkModeChange' as any, handleDarkModeChange);
    return () => window.removeEventListener('darkModeChange' as any, handleDarkModeChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: !darkMode }));
  };

  const theme = useMemo<Theme>(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#96BBBB',
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
      background: darkMode ? {
        default: '#121212',
        paper: '#1e1e1e',
      } : {
        default: '#EAE5D7',
        paper: '#ffffff',
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
      text: darkMode ? {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      } : {
        primary: '#333333',
        secondary: '#666666',
      },
    },
    typography: {
      fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            padding: '8px 22px',
            boxShadow: darkMode ? '0 2px 5px rgba(0, 0, 0, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          },
          contained: {
            '&:hover': {
              boxShadow: darkMode ? '0 4px 10px rgba(0, 0, 0, 0.5)' : '0 4px 10px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode ? '0 4px 10px rgba(0, 0, 0, 0.4)' : '0 4px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: darkMode ? '0 2px 10px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#96BBBB',
              },
            },
          },
        },
      },
    },
  }), [darkMode]);

  const value: ThemeContextType = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
