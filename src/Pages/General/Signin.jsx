import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Middleware/Auth";
import "../../Scss/General/signin.scss";
import AlertMessage from "../Custom/AlertMessage";
import WarningModal from "../Custom/WarningModal";
import CheckToken from "../../utils/CheckToken";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { storetoken, logoutUser } = useAuth();
  const BackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const logoUrl = `./logo.png`;
  const softwareName = "SavoryOps";

  useEffect(() => {
    document.title = "Sign In";
  }, []);

  const messageParam = searchParams.get("message");
  const stateMessage = location.state?.message;
  const alertMessage = messageParam
    ? decodeURIComponent(messageParam)
    : stateMessage || "";

  const handleAlertClose = () => {
    if (messageParam) {
      setSearchParams({}, { replace: true });
    }
    if (stateMessage) {
      navigate(location.pathname, { replace: true });
    }
  };

  const checkToken = async () => {
    if (!CheckToken(token, logoutUser, navigate)) return;

    try {
      const response = await fetch(
        `${BackendPath}/general/admin/verify-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        navigate("/Home/Dashboard");
      } else {
        logoutUser();
        navigate("/Signin");
      }
    } catch {
      logoutUser();
      navigate("/Signin");
    }
  };

  useEffect(() => {
    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BackendPath, token, tokenname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");
    try {
      const response = await fetch(`${BackendPath}/general/admin/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        storetoken(data.admin.Token);
        navigate("/Home/Dashboard");
      } else {
        setFormError(data.message || "Server error. Please try again.");
      }
    } catch {
      setWarningMessage("Server error. Please try again.");
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showWarning && (
        <WarningModal
          message={warningMessage}
          onClose={() => setShowWarning(false)}
        />
      )}
      {alertMessage && (
        <AlertMessage message={alertMessage} onClose={handleAlertClose} />
      )}
      <div className="full-page">
        <div className="login-container">
          <div className="logo-container">
            <div className="logo-button">
              <img src={logoUrl} className="logo" alt="Logo" />
              <h2>{softwareName}</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {formError && <div className="error-message">{formError}</div>}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
