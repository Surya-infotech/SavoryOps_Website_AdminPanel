import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import '../../Scss/General/signin.scss';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import CheckToken from '../../utils/CheckToken';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { storetoken, logoutUser } = useAuth();
    const [alertMessage, setAlertMessage] = useState('');
    const BackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const FALLBACK_LOGO = `${import.meta.env.BASE_URL}logo.png`;
    const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO);
    const [softwareName, setSoftwareName] = useState('SavoryOps');
    const HOME_URL = import.meta.env.VITE_HOME_URL || '/';

    useEffect(() => {
        document.title = 'Sign In';
    }, []);

    useEffect(() => {
        const messageParam = searchParams.get('message');
        if (messageParam) {
            setAlertMessage(decodeURIComponent(messageParam));
            setSearchParams({}, { replace: true });
        } else if (location.state && location.state.message) {
            setAlertMessage(location.state.message);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate, searchParams, setSearchParams]);

    const checkToken = async () => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        try {
            const response = await fetch(`${BackendPath}/General/admin/verify-token`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-user': 'admin',
                },
            });

            if (response.ok) {
                navigate('/Home/Dashboard');
            } else {
                logoutUser();
                navigate('/Signin');
            }
        } catch {
            logoutUser();
            navigate('/Signin');
        }
    };

    useEffect(() => {
        checkToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [BackendPath, token, tokenname]);

    useEffect(() => {
        const fetchLandingPageSettings = async () => {
            try {
                const response = await fetch(
                    `${BackendPath}/System/GetGeneralSetting_landingpage`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json', 'x-user': 'admin' },
                    }
                );
                const data = await response.json();
                if (!response.ok || !data) return;

                const nextLogo = data?.themeSetting?.logourl;
                const nextName = data?.generalSetting?.softwarename;

                if (nextLogo) setLogoUrl(nextLogo);
                if (nextName) setSoftwareName(nextName);
            } catch {
                /* keep defaults when API fails */
            }
        };

        fetchLandingPageSettings();
    }, [BackendPath]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError('');
        try {
            const response = await fetch(`${BackendPath}/General/admin/Signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user': 'admin' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                storetoken(data.admin.Token);
                navigate('/Home/Dashboard');
            } else {
                const errorMessages = {
                    'Invalid Email': 'Invalid email address.',
                    'All fields are required': 'All fields are required.',
                    'Invalid Password': 'Invalid password.',
                };
                setFormError(errorMessages[data.message] || 'Server error. Please try again.');
            }
        } catch {
            setWarningMessage('Server error. Please try again.');
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoAdmin = () => {
        setEmail('superadmin@savoryops.com');
        setPassword('12345678');
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
                <AlertMessage
                    message={alertMessage}
                    onClose={() => setAlertMessage('')}
                />
            )}
            <div className="full-page">
                <div className="login-container">
                    <div className="logo-container">
                        <a href={HOME_URL} className="logo-button">
                            <img
                                src={logoUrl}
                                className="logo"
                                alt="Logo"
                                onError={() => setLogoUrl(FALLBACK_LOGO)}
                            />
                            <h2>{softwareName}</h2>
                        </a>
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
                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <button
                            type="button"
                            className="demo-admin-button"
                            onClick={handleDemoAdmin}
                        >
                            Demo Super Admin
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
