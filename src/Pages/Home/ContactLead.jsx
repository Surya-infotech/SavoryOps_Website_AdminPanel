import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GetContactLead from '../../Components/Home/ContactLead/GetContactLead';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import '../../Scss/Home/ContactLead/contactlead.scss';

const ContactLead = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        document.title = 'Contact Lead';
    }, []);

    const alertMessage = location.state?.message || '';
    const warningMessage = location.state?.warning || '';

    const clearLocationState = () => {
        navigate(location.pathname, { replace: true });
    };

    return (
        <div className="ContactLead-container">
            <div className="contactlead-container">
                <h6 className="contactlead-headingname">Contact Lead</h6>
                <div className="contactlead-form-container">
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
                    <div className="contactlead-header">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    <GetContactLead searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default ContactLead;
