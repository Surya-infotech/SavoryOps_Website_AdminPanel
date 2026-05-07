import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { muiTheme } from "./theme/muiTheme.js";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.scss";
import AdminLogin from "./Pages/General/Signin.jsx";
import Logout from "./Pages/General/Logout.jsx";
import AdminNavbar from "./Pages/Partials/AdminNavbar.jsx";
import HoriNavbar from "./Pages/Partials/HoriNavbar.jsx";
import MainRouter from "./Router/Main.jsx";

const AppContent = () => {
  const location = useLocation();

  const isLoginPage =
    location.pathname === "/" ||
    location.pathname.toLowerCase().startsWith("/signin");

  return (
    <>
      {!isLoginPage && <AdminNavbar />}
      {!isLoginPage && <HoriNavbar />}
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/Signin" element={<AdminLogin />} />
        <Route path="/Logout" element={<Logout />} />
        <Route path="/Home/*" element={<MainRouter />} />
      </Routes>
    </>
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
