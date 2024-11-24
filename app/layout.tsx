
import React from 'react';
import { AppProvider } from './AppContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Providers } from './providers';

// Create a custom theme with student-friendly colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a148c', // Deep purple, representing knowledge and wisdom
    },
    secondary: {
      main: '#ff6f00', // Bright orange, representing energy and creativity
    },
    background: {
      default: '#f5f5f5', // Light grey background for better readability
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </AppProvider>
        </Providers>
      </body>
    </html>
  );
}
