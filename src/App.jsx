import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { muiTheme } from "./theme/muiTheme.js";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.scss";
import AdminLogin from "./Pages/General/Signin.jsx";

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/Signin" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
