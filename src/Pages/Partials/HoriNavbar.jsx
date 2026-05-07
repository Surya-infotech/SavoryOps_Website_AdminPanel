import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import '../../Scss/Partials/horinavbar.scss';
import profilePlaceholder from '../../assets/profile-placeholder.png';

const HoriNavbar = () => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => setDropdownVisible((prev) => !prev);
    const closeDropdown = () => setDropdownVisible(false);

    useEffect(() => {
        if (!isDropdownVisible) return;

        const handleClickOutside = (event) => {
            const dropdownMenu = document.querySelector('.hori-navbar .dropdown-menu');
            const profileSection = document.querySelector('.hori-navbar .profile-section');
            if (
                dropdownMenu &&
                !dropdownMenu.contains(event.target) &&
                profileSection &&
                !profileSection.contains(event.target)
            ) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownVisible]);

    return (
        <nav className="hori-navbar">
            <div className="right-side" />
            <div className="profile-section" onClick={toggleDropdown}>
                <img
                    src={profilePlaceholder}
                    alt="Profile"
                    className="profile-photo"
                />
            </div>
            {isDropdownVisible && (
                <div className="dropdown-menu">
                    <ul className="nav-links admintab admintab--hori-dropdown">
                        <li>
                            <NavLink
                                to="/Home/Dashboard"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={closeDropdown}
                            >
                                <HomeIcon
                                    style={{
                                        color: 'var(--primary-color)',
                                        marginRight: '10px',
                                    }}
                                />
                                Home
                            </NavLink>
                        </li>
                        <li className="hori-dropdown-divider" aria-hidden="true">
                            <hr />
                        </li>
                        <li>
                            <NavLink
                                to="/Logout"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={closeDropdown}
                            >
                                <LogoutIcon
                                    style={{
                                        color: 'var(--primary-color)',
                                        marginRight: '10px',
                                    }}
                                />
                                Logout
                            </NavLink>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default HoriNavbar;
