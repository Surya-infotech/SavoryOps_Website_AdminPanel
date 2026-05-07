import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowDownward,
    ArrowUpward,
    UnfoldMore,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useAuth } from '../../../Middleware/Auth';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import Pagination from '../../../Pages/Custom/Pagination';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import '../../../Scss/Home/ContactLead/getcontactlead.scss';

const STATUS_OPTIONS = [
    { label: 'Requested', value: 'requested' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'On Going', value: 'ongoing' },
    { label: 'Hold', value: 'hold' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Completed', value: 'completed' },
];

const getStatusOption = (status) => {
    if (!status) return null;
    const raw = String(status).trim();
    const normalized = raw.toLowerCase().replace(/\s+/g, '_');
    return (
        STATUS_OPTIONS.find(
            (opt) =>
                opt.value === normalized ||
                opt.label.toLowerCase() === raw.toLowerCase(),
        ) || null
    );
};

const getStatusLabel = (status) => {
    if (!status) return '';
    const match = getStatusOption(status);
    return match ? match.label : String(status);
};

const getStatusClass = (status) => {
    if (!status) return '';
    const match = getStatusOption(status);
    const slug = match
        ? match.value
        : String(status).toLowerCase().replace(/\s+/g, '_');
    return `status-${slug}`;
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
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [contactList, setContactList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [viewModalContact, setViewModalContact] = useState(null);
    const [statusDropdownId, setStatusDropdownId] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const statusWrapperRef = useRef(null);

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

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
                if (HandleUnauthorized(data, logoutUser, navigate)) return;

                if (response.ok) {
                    setContactList(Array.isArray(data?.leads) ? data.leads : []);
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

    const filteredContacts = contactList.filter((item) =>
        Object.values(item).some((value) =>
            value?.toString().toLowerCase().startsWith(searchValue.toLowerCase()),
        ),
    );

    const totalRecords = filteredContacts.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const visibleContacts = filteredContacts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const handleWarningClose = () => setShowWarning(false);
    const handleCloseViewModal = () => setViewModalContact(null);

    const handleStatusTriggerClick = (e, contactId) => {
        e.stopPropagation();
        if (statusDropdownId === contactId) {
            setStatusDropdownId(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownPos({
            top: rect.bottom + 4,
            left: rect.left,
        });
        setStatusDropdownId(contactId);
    };

    const handleStatusSelect = async (contactId, option) => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const newStatus = option.label;
        const target = contactList.find((c) => c._id === contactId);
        const previousStatus = target?.status;
        const previousMatch = getStatusOption(previousStatus);
        if (previousMatch && previousMatch.value === option.value) {
            setStatusDropdownId(null);
            return;
        }

        setContactList((prev) =>
            prev.map((c) => (c._id === contactId ? { ...c, status: newStatus } : c)),
        );
        setStatusDropdownId(null);

        try {
            const response = await fetch(
                `${adminPanelBackendPath}/system/contactlead/${contactId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                },
            );
            const data = await response.json().catch(() => ({}));

            if (HandleUnauthorized(data, logoutUser, navigate)) {
                setContactList((prev) =>
                    prev.map((c) =>
                        c._id === contactId ? { ...c, status: previousStatus } : c,
                    ),
                );
                return;
            }

            if (!response.ok) {
                setContactList((prev) =>
                    prev.map((c) =>
                        c._id === contactId ? { ...c, status: previousStatus } : c,
                    ),
                );
                setWarningMessage(
                    data?.message || 'Failed to update status. Please try again.',
                );
                setShowWarning(true);
                return;
            }

            const updatedLead = data?.contactLead || data?.lead || data?.data;
            if (updatedLead && updatedLead._id) {
                setContactList((prev) =>
                    prev.map((c) => (c._id === contactId ? { ...c, ...updatedLead } : c)),
                );
            }

            setAlertMessage(data?.message || 'Status updated successfully');
            setShowAlert(true);
        } catch {
            setContactList((prev) =>
                prev.map((c) =>
                    c._id === contactId ? { ...c, status: previousStatus } : c,
                ),
            );
            setWarningMessage('Server error. Please try again.');
            setShowWarning(true);
        }
    };

    useEffect(() => {
        if (!statusDropdownId) return undefined;
        const handleClickOutside = (e) => {
            if (
                statusWrapperRef.current &&
                !statusWrapperRef.current.contains(e.target)
            ) {
                setStatusDropdownId(null);
            }
        };
        const handleViewportChange = () => setStatusDropdownId(null);
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleViewportChange, true);
        window.addEventListener('resize', handleViewportChange);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleViewportChange, true);
            window.removeEventListener('resize', handleViewportChange);
        };
    }, [statusDropdownId]);

    return (
        <>
            {showAlert && (
                <AlertMessage
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                />
            )}
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
                                <th onClick={() => sortContactList('country')}>
                                    Country {renderSortIcon('country')}
                                </th>
                                <th onClick={() => sortContactList('status')}>
                                    Status {renderSortIcon('status')}
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
                                    <tr key={contact._id}>
                                        <td>{contact.fullname}</td>
                                        <td>{contact.email}</td>
                                        <td>{contact.country}</td>
                                        <td className="status-cell">
                                            <div
                                                className="status-cell-wrapper"
                                                ref={
                                                    statusDropdownId === contact._id
                                                        ? statusWrapperRef
                                                        : null
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="status-badge-trigger"
                                                    onClick={(e) =>
                                                        handleStatusTriggerClick(
                                                            e,
                                                            contact._id,
                                                        )
                                                    }
                                                >
                                                    {contact.status ? (
                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                contact.status,
                                                            )}`}
                                                        >
                                                            {getStatusLabel(contact.status)}
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge">-</span>
                                                    )}
                                                </button>
                                                {statusDropdownId === contact._id && (
                                                    <ul
                                                        className="status-dropdown-menu"
                                                        style={{
                                                            top: `${dropdownPos.top}px`,
                                                            left: `${dropdownPos.left}px`,
                                                        }}
                                                    >
                                                        {STATUS_OPTIONS.map((opt) => {
                                                            const currentMatch =
                                                                getStatusOption(contact.status);
                                                            const isSelected =
                                                                currentMatch?.value ===
                                                                opt.value;
                                                            return (
                                                                <li key={opt.value}>
                                                                    <button
                                                                        type="button"
                                                                        className={`status-dropdown-option${
                                                                            isSelected
                                                                                ? ' is-selected'
                                                                                : ''
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleStatusSelect(
                                                                                contact._id,
                                                                                opt,
                                                                            )
                                                                        }
                                                                    >
                                                                        <span
                                                                            className={`status-badge status-${opt.value}`}
                                                                        >
                                                                            {opt.label}
                                                                        </span>
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
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
                                <tr className="empty-row">
                                    <td colSpan="6">No contact leads found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                pageSizeOptions={[10, 15, 20, 50]}
                selectedPageSize={pageSize}
                onPageSizeChange={(size) => setPageSize(size)}
                totalRecords={totalRecords}
            />

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
                                    <div className="contactlead-view-grid contactlead-view-grid-3">
                                        <div className="contactlead-view-row">
                                            <span className="contactlead-view-label">
                                                Full Name:
                                            </span>
                                            <span className="contactlead-view-value">
                                                {viewModalContact.fullname || '-'}
                                            </span>
                                        </div>
                                        <div className="contactlead-view-row">
                                            <span className="contactlead-view-label">
                                                Country:
                                            </span>
                                            <span className="contactlead-view-value">
                                                {viewModalContact.country || '-'}
                                            </span>
                                        </div>
                                        <div className="contactlead-view-row">
                                            <span className="contactlead-view-label">Status:</span>
                                            <span className="contactlead-view-value">
                                                {viewModalContact.status ? (
                                                    <span
                                                        className={`status-badge ${getStatusClass(
                                                            viewModalContact.status,
                                                        )}`}
                                                    >
                                                        {getStatusLabel(viewModalContact.status)}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="contactlead-view-grid">
                                        <div className="contactlead-view-row">
                                            <span className="contactlead-view-label">Email:</span>
                                            <span className="contactlead-view-value">
                                                {viewModalContact.email || '-'}
                                            </span>
                                        </div>
                                        <div className="contactlead-view-row">
                                            <span className="contactlead-view-label">
                                                Timezone:
                                            </span>
                                            <span className="contactlead-view-value">
                                                {viewModalContact.timezone || '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="contactlead-view-grid">
                                        <div className="contactlead-view-row">
                                            <span className="contactlead-view-label">
                                                Submitted On:
                                            </span>
                                            <span className="contactlead-view-value">
                                                {formatDate(viewModalContact.createdAt)}
                                            </span>
                                        </div>
                                        <div className="contactlead-view-row">
                                            <span className="contactlead-view-label">
                                                Last Updated:
                                            </span>
                                            <span className="contactlead-view-value">
                                                {formatDate(viewModalContact.updatedAt)}
                                            </span>
                                        </div>
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