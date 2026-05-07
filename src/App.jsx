import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { applyThemeFavicon } from "./utils/applyThemeFavicon.js";
import { applyThemeColors } from "./utils/applyThemeColors.js";
import { muiTheme } from "./theme/muiTheme.js";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.scss";
import AdminLogin from "./Pages/General/Signin.jsx";

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    applyThemeFavicon();
    applyThemeColors();
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/Signin" element={<AdminLogin />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
