import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';

const Logout = () => {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logoutUser();
        document.body.classList.remove('body-move-left-80', 'body-move-left-150');
        navigate('/Signin', {
            replace: true,
            state: { message: 'You have been signed out successfully.' },
        });
    }, [logoutUser, navigate]);

    return null;
};

export default Logout;
