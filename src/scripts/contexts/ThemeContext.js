import React from 'react';
import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { idID } from '@mui/material/locale';

const theme = createTheme(
  {
    palette: {
      primary: {
        light: '#757ce8',
        main: '#3f50b5',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#80deea',
        main: '#00bcd4',
        dark: '#00838f',
        contrastText: '#fff',
      },
      custom: {
        thBackground: '#e0e0e0',
        thText: '#424242',
      },
    },
  },
  idID
);

export default function ThemeContext({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
