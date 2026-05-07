import { Route, Routes } from 'react-router-dom';
import Dashboard from '../Pages/Home/Dashboard';
import ContactLead from '../Pages/Home/ContactLead';
import DemoBook from '../Pages/Home/DemoBook';

const MainRouter = () => {
    return (
        <Routes>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/ContactLead" element={<ContactLead />} />
            <Route path="/DemoBook" element={<DemoBook />} />
        </Routes>
    );
};

export default MainRouter;
