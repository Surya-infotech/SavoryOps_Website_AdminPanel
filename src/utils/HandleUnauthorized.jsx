const unauthorizedMessages = [
    'Unauthorized, Token Not Get',
    'Unauthorized, Token does not match',
    'Token expired, please log in again',
    'Invalid token, please log in again',
    "Invalid or expired token",
    "Invalid token",
    "Session expired, please sign in again",
    "Token missing"
];

const HandleUnauthorized = (result, logoutUser, navigate) => {
    if (unauthorizedMessages.includes(result?.message)) {
        logoutUser();
        navigate('/Signin');
        return true;
    }

    return false;
};

export default HandleUnauthorized;
