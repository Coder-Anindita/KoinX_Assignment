import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0a0a0a",
      paper: "#111111",
    },
    primary: {
      main: "#a78bfa",
    },
    text: {
      primary: "#ffffff",
      secondary: "#9ca3af",
    },
  },
});

// Wrap your app:
<ThemeProvider theme={darkTheme}>
  <CssBaseline />
  {children}
</ThemeProvider>