import { useEffect, useState } from 'react';
import '../../Scss/Custom/alertmessage.scss';

const AlertMessage = ({ message, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);
    const animationDuration = 500;

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, animationDuration);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className={`alert-message ${isExiting ? 'slide-out' : 'slide-in'}`}
            onClick={handleClose}
        >
            {message}
        </div>
    );
};

export default AlertMessage;
