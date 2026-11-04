import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter } from "react-router";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#087e8b", dark: "#06636e", contrastText: "#ffffff" },
    secondary: { main: "#d49a2a", contrastText: "#17324d" },
    background: { default: "#f4f7f8", paper: "#ffffff" },
    text: { primary: "#243746", secondary: "#627481" },
    divider: "#e1e8eb",
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
    h1: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.04em" },
    h2: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
