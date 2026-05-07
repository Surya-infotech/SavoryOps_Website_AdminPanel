import { useEffect } from 'react';
import '../../Scss/Home/dashboard.scss';

const Dashboard = () => {
    useEffect(() => {
        document.title = 'Dashboard';
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome to the SavoryOps admin panel.</p>
            </div>
            <div className="dashboard-grid">
                <div className="stat-card">
                    <span className="stat-label">Contact Leads</span>
                    <span className="stat-value">—</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Demo Bookings</span>
                    <span className="stat-value">—</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Users</span>
                    <span className="stat-value">—</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
