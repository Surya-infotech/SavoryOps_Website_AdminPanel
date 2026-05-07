import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowDownward,
    ArrowUpward,
    UnfoldMore,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import Pagination from '../../../Pages/Custom/Pagination';
import WarningModal from '../../../Pages/Custom/WarningModal';
import '../../../Scss/Home/ContactLead/getcontactlead.scss';

const MESSAGE_TRUNCATE_LENGTH = 50;

const truncateMessage = (text) => {
    if (!text) return '-';
    const str = String(text);
    if (str.length <= MESSAGE_TRUNCATE_LENGTH) return str;
    return `${str.slice(0, MESSAGE_TRUNCATE_LENGTH)}...`;
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
};

const GetContactLead = ({ searchValue }) => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [loading, setLoading] = useState(true);
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [contactList, setContactList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [viewModalContact, setViewModalContact] = useState(null);

    useEffect(() => {
        if (!token) {
            logoutUser();
            navigate('/Signin');
            return;
        }

        const fetchContactLeads = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${adminPanelBackendPath}/system/contactlead`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );
                const data = await response.json();

                if (response.ok) {
                    const list = Array.isArray(data)
                        ? data
                        : Array.isArray(data?.contactLeads)
                            ? data.contactLeads
                            : Array.isArray(data?.data)
                                ? data.data
                                : data
                                    ? [data]
                                    : [];
                    setContactList(list);
                } else {
                    setWarningMessage(
                        data?.message || 'Server error. Please try again.',
                    );
                    setShowWarning(true);
                }
            } catch {
                setWarningMessage('Server error. Please try again.');
                setShowWarning(true);
            } finally {
                setLoading(false);
            }
        };

        fetchContactLeads();
    }, [adminPanelBackendPath, token, logoutUser, navigate]);

    const renderSortIcon = (column) => {
        if (sortColumn !== column) return <UnfoldMore fontSize="small" />;
        return sortDirection === 'asc' ? (
            <ArrowUpward fontSize="small" />
        ) : (
            <ArrowDownward fontSize="small" />
        );
    };

    const sortContactList = (column) => {
        const direction =
            sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);

        const sorted = [...contactList].sort((a, b) => {
            const valA = a?.[column] ?? '';
            const valB = b?.[column] ?? '';
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setContactList(sorted);
    };

    const filteredContacts = contactList.filter((item) => {
        const lowerSearch = (searchValue || '').toLowerCase();
        if (!lowerSearch) return true;
        return Object.values(item).some((value) =>
            value?.toString().toLowerCase().includes(lowerSearch),
        );
    });

    const totalRecords = filteredContacts.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const visibleContacts = filteredContacts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const handleWarningClose = () => setShowWarning(false);
    const handleCloseViewModal = () => setViewModalContact(null);

    return (
        <>
            {showWarning && (
                <WarningModal message={warningMessage} onClose={handleWarningClose} />
            )}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="tablediv">
                    <table className="contactleadtable">
                        <thead>
                            <tr>
                                <th onClick={() => sortContactList('fullname')}>
                                    Full Name {renderSortIcon('fullname')}
                                </th>
                                <th onClick={() => sortContactList('email')}>
                                    Email {renderSortIcon('email')}
                                </th>
                                <th onClick={() => sortContactList('phone')}>
                                    Phone {renderSortIcon('phone')}
                                </th>
                                <th onClick={() => sortContactList('message')}>
                                    Message {renderSortIcon('message')}
                                </th>
                                <th onClick={() => sortContactList('createdAt')}>
                                    Submitted On {renderSortIcon('createdAt')}
                                </th>
                                <th className="contactlead-view-th">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleContacts.length > 0 ? (
                                visibleContacts.map((contact) => (
                                    <tr key={contact._id || contact.id || contact.email}>
                                        <td>{contact.fullname || contact.name || '-'}</td>
                                        <td>{contact.email || '-'}</td>
                                        <td>{contact.phone || '-'}</td>
                                        <td
                                            className="contactlead-message-cell"
                                            title={contact.message || ''}
                                        >
                                            {truncateMessage(contact.message)}
                                        </td>
                                        <td>{formatDate(contact.createdAt)}</td>
                                        <td>
                                            <IconButton
                                                onClick={() => setViewModalContact(contact)}
                                                aria-label="View"
                                                className="view-icon"
                                                size="small"
                                            >
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">No data found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    pageSizeOptions={[10, 15, 20, 50]}
                    selectedPageSize={pageSize}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    totalRecords={totalRecords}
                />
            )}

            {viewModalContact && (
                <div
                    className="modal fade show contactlead-view-modal"
                    style={{ display: 'block' }}
                    tabIndex="-1"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="contactlead-view-modal-backdrop"
                        onClick={handleCloseViewModal}
                    />
                    <div className="contactlead-view-modal-dialog-wrapper">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Contact Details</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleCloseViewModal}
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body contactlead-view-modal-body">
                                    <div className="contactlead-view-row">
                                        <span className="contactlead-view-label">Full Name:</span>
                                        <span className="contactlead-view-value">
                                            {viewModalContact.fullname ||
                                                viewModalContact.name ||
                                                '-'}
                                        </span>
                                    </div>
                                    <div className="contactlead-view-row">
                                        <span className="contactlead-view-label">Email:</span>
                                        <span className="contactlead-view-value">
                                            {viewModalContact.email || '-'}
                                        </span>
                                    </div>
                                    <div className="contactlead-view-row">
                                        <span className="contactlead-view-label">Phone:</span>
                                        <span className="contactlead-view-value">
                                            {viewModalContact.phone || '-'}
                                        </span>
                                    </div>
                                    <div className="contactlead-view-row">
                                        <span className="contactlead-view-label">
                                            Submitted On:
                                        </span>
                                        <span className="contactlead-view-value">
                                            {formatDate(viewModalContact.createdAt)}
                                        </span>
                                    </div>
                                    <div className="contactlead-view-row contactlead-view-row-message">
                                        <span className="contactlead-view-label">Message:</span>
                                        <span className="contactlead-view-value contactlead-view-message">
                                            {viewModalContact.message || '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleCloseViewModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GetContactLead;
