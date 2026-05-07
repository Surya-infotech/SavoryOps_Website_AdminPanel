import { useEffect } from 'react';
import '../../Scss/Home/dashboard.scss';

const DemoBook = () => {
    useEffect(() => {
        document.title = 'Demo Book';
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Demo Book</h1>
                <p>All demo booking requests will appear here.</p>
            </div>
            <div className="empty-state">
                <p>No demo bookings to show yet.</p>
            </div>
        </div>
    );
};

export default DemoBook;
