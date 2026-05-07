import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Tooltip from '@mui/material/Tooltip';
import '../../Scss/Partials/adminnavbar.scss';

const NAV_ITEMS = [
    { to: '/Home/Dashboard', label: 'Dashboard', Icon: LeaderboardIcon },
    { to: '/Home/ContactLead', label: 'Contact Lead', Icon: ContactMailIcon },
    { to: '/Home/DemoBook', label: 'Demo Book', Icon: EventAvailableIcon },
];

const AdminNavbar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

    const toggleNavbar = () => setIsCollapsed((prev) => !prev);

    useEffect(() => {
        if (isCollapsed) {
            document.body.classList.add('body-move-left-80');
            document.body.classList.remove('body-move-left-150');
        } else {
            document.body.classList.add('body-move-left-150');
            document.body.classList.remove('body-move-left-80');
        }
        return () => {
            document.body.classList.remove(
                'body-move-left-80',
                'body-move-left-150',
            );
        };
    }, [isCollapsed]);

    return (
        <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="logo">
                <div className="logoimage">
                    <img src={logoUrl} className="logo-img" alt="Logo" />
                </div>
                <div className={`arrowdiv ${isCollapsed ? 'collapsed' : ''}`}>
                    {isCollapsed ? (
                        <KeyboardArrowRightIcon
                            className="arrow-icon"
                            onClick={toggleNavbar}
                        />
                    ) : (
                        <KeyboardArrowLeftIcon
                            className="arrow-icon"
                            onClick={toggleNavbar}
                        />
                    )}
                </div>
            </div>
            <ul className="nav-links admintab">
                <h6 className="category-heading">Main</h6>
                {NAV_ITEMS.map(({ to, label, Icon }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            <Tooltip
                                title={label}
                                placement="right"
                                arrow
                                disableHoverListener={!isCollapsed}
                            >
                                <Icon
                                    style={{
                                        color: 'var(--primary-color)',
                                        marginRight: '10px',
                                    }}
                                />
                            </Tooltip>
                            {label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default AdminNavbar;
