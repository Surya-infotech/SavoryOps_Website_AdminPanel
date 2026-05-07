import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GetDemoBook from '../../Components/Home/DemoBook/GetDemoBook';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import '../../Scss/Home/DemoBook/demobook.scss';

const DemoBook = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        document.title = 'Demo Book';
    }, []);

    const alertMessage = location.state?.message || '';
    const warningMessage = location.state?.warning || '';

    const clearLocationState = () => {
        navigate(location.pathname, { replace: true });
    };

    return (
        <div className="DemoBook-container">
            <div className="demobook-container">
                <h6 className="demobook-headingname">Demo Book</h6>
                <div className="demobook-form-container">
                    {alertMessage && (
                        <AlertMessage
                            message={alertMessage}
                            onClose={clearLocationState}
                        />
                    )}
                    {warningMessage && (
                        <WarningModal
                            message={warningMessage}
                            onClose={clearLocationState}
                        />
                    )}
                    <div className="demobook-header">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    <GetDemoBook searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default DemoBook;