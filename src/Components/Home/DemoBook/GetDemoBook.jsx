import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownward,
  ArrowUpward,
  UnfoldMore,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useAuth } from "../../../Middleware/Auth";
import AlertMessage from "../../../Pages/Custom/AlertMessage";
import LoadingSpinner from "../../../Pages/Custom/LoadingSpinner";
import Pagination from "../../../Pages/Custom/Pagination";
import WarningModal from "../../../Pages/Custom/WarningModal";
import CheckToken from "../../../utils/CheckToken";
import HandleUnauthorized from "../../../utils/HandleUnauthorized";
import "../../../Scss/Home/DemoBook/getdemobook.scss";

const STATUS_OPTIONS = [
  { label: "Requested", value: "requested" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In Progress", value: "in_progress" },
  { label: "On Going", value: "ongoing" },
  { label: "Hold", value: "hold" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const getStatusOption = (status) => {
  if (!status) return null;
  const raw = String(status).trim();
  const normalized = raw.toLowerCase().replace(/\s+/g, "_");
  return (
    STATUS_OPTIONS.find(
      (opt) =>
        opt.value === normalized ||
        opt.label.toLowerCase() === raw.toLowerCase(),
    ) || null
  );
};

const getStatusLabel = (status) => {
  if (!status) return "";
  const match = getStatusOption(status);
  return match ? match.label : String(status);
};

const getStatusClass = (status) => {
  if (!status) return "";
  const match = getStatusOption(status);
  const slug = match
    ? match.value
    : String(status).toLowerCase().replace(/\s+/g, "_");
  return `status-${slug}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatPreferredDate = (value) => {
  if (!value) return "-";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, mo, d] = match;
    const date = new Date(`${y}-${mo}-${d}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    }
  }
  return String(value);
};

const formatPreferredTime = (value) => {
  if (!value) return "-";
  return String(value);
};

const GetDemoBook = ({ searchValue }) => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);

  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [bookingList, setBookingList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewModalBooking, setViewModalBooking] = useState(null);
  const [statusDropdownId, setStatusDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const statusWrapperRef = useRef(null);

  useEffect(() => {
    if (!CheckToken(token, logoutUser, navigate)) return;

    const fetchDemoBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${adminPanelBackendPath}/system/demobook`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        if (HandleUnauthorized(data, logoutUser, navigate)) return;

        if (response.ok) {
          setBookingList(Array.isArray(data?.demos) ? data.demos : []);
        } else {
          setWarningMessage(data?.message || "Server error. Please try again.");
          setShowWarning(true);
        }
      } catch {
        setWarningMessage("Server error. Please try again.");
        setShowWarning(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoBookings();
  }, [adminPanelBackendPath, token, logoutUser, navigate]);

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return <UnfoldMore fontSize="small" />;
    return sortDirection === "asc" ? (
      <ArrowUpward fontSize="small" />
    ) : (
      <ArrowDownward fontSize="small" />
    );
  };

  const sortBookingList = (column) => {
    const direction =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...bookingList].sort((a, b) => {
      const valA = a?.[column] ?? "";
      const valB = b?.[column] ?? "";
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setBookingList(sorted);
  };

  const filteredBookings = bookingList.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().startsWith(searchValue.toLowerCase()),
    ),
  );

  const totalRecords = filteredBookings.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const visibleBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleWarningClose = () => setShowWarning(false);
  const handleCloseViewModal = () => setViewModalBooking(null);

  const handleStatusTriggerClick = (e, bookingId) => {
    e.stopPropagation();
    if (statusDropdownId === bookingId) {
      setStatusDropdownId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setStatusDropdownId(bookingId);
  };

  const handleStatusSelect = async (bookingId, option) => {
    if (!CheckToken(token, logoutUser, navigate)) return;

    const newStatus = option.label;
    const target = bookingList.find((b) => b._id === bookingId);
    const previousStatus = target?.status;
    const previousMatch = getStatusOption(previousStatus);
    if (previousMatch && previousMatch.value === option.value) {
      setStatusDropdownId(null);
      return;
    }

    setBookingList((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b)),
    );
    setStatusDropdownId(null);

    try {
      const response = await fetch(
        `${adminPanelBackendPath}/system/demobook/${bookingId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await response.json().catch(() => ({}));

      if (HandleUnauthorized(data, logoutUser, navigate)) {
        setBookingList((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: previousStatus } : b,
          ),
        );
        return;
      }

      if (!response.ok) {
        setBookingList((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: previousStatus } : b,
          ),
        );
        setWarningMessage(
          data?.message || "Failed to update status. Please try again.",
        );
        setShowWarning(true);
        return;
      }

      const updatedBooking =
        data?.demo || data?.demobook || data?.booking || data?.data;
      if (updatedBooking && updatedBooking._id) {
        setBookingList((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, ...updatedBooking } : b,
          ),
        );
      }

      setAlertMessage(data?.message || "Status updated successfully");
      setShowAlert(true);
    } catch {
      setBookingList((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: previousStatus } : b,
        ),
      );
      setWarningMessage("Server error. Please try again.");
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
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
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
          <table className="demobooktable">
            <thead>
              <tr>
                <th onClick={() => sortBookingList("fullname")}>
                  Full Name {renderSortIcon("fullname")}
                </th>
                <th onClick={() => sortBookingList("email")}>
                  Email {renderSortIcon("email")}
                </th>
                <th onClick={() => sortBookingList("phone")}>
                  Phone {renderSortIcon("phone")}
                </th>
                <th onClick={() => sortBookingList("status")}>
                  Status {renderSortIcon("status")}
                </th>
                <th onClick={() => sortBookingList("createdAt")}>
                  Submitted On {renderSortIcon("createdAt")}
                </th>
                <th className="demobook-view-th">View</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.length > 0 ? (
                visibleBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.fullname}</td>
                    <td>{booking.email}</td>
                    <td>{booking.phone || "-"}</td>
                    <td className="status-cell">
                      <div
                        className="status-cell-wrapper"
                        ref={
                          statusDropdownId === booking._id
                            ? statusWrapperRef
                            : null
                        }
                      >
                        <button
                          type="button"
                          className="status-badge-trigger"
                          onClick={(e) =>
                            handleStatusTriggerClick(e, booking._id)
                          }
                        >
                          {booking.status ? (
                            <span
                              className={`status-badge ${getStatusClass(
                                booking.status,
                              )}`}
                            >
                              {getStatusLabel(booking.status)}
                            </span>
                          ) : (
                            <span className="status-badge">-</span>
                          )}
                        </button>
                        {statusDropdownId === booking._id && (
                          <ul
                            className="status-dropdown-menu"
                            style={{
                              top: `${dropdownPos.top}px`,
                              left: `${dropdownPos.left}px`,
                            }}
                          >
                            {STATUS_OPTIONS.map((opt) => {
                              const currentMatch = getStatusOption(
                                booking.status,
                              );
                              const isSelected =
                                currentMatch?.value === opt.value;
                              return (
                                <li key={opt.value}>
                                  <button
                                    type="button"
                                    className={`status-dropdown-option${
                                      isSelected ? " is-selected" : ""
                                    }`}
                                    onClick={() =>
                                      handleStatusSelect(booking._id, opt)
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
                    <td>{formatDate(booking.createdAt)}</td>
                    <td>
                      <IconButton
                        onClick={() => setViewModalBooking(booking)}
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
                  <td colSpan="6">No demo bookings found</td>
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

      {viewModalBooking && (
        <div
          className="modal fade show demobook-view-modal"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="demobook-view-modal-backdrop"
            onClick={handleCloseViewModal}
          />
          <div className="demobook-view-modal-dialog-wrapper">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Demo Booking Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseViewModal}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body demobook-view-modal-body">
                  <div className="demobook-view-grid demobook-view-grid-3">
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">Full Name:</span>
                      <span className="demobook-view-value">
                        {viewModalBooking.fullname || "-"}
                      </span>
                    </div>
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">Email:</span>
                      <span className="demobook-view-value">
                        {viewModalBooking.email || "-"}
                      </span>
                    </div>
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">Phone:</span>
                      <span className="demobook-view-value">
                        {viewModalBooking.phone || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="demobook-view-grid demobook-view-grid-3">
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">Status:</span>
                      <span className="demobook-view-value">
                        {viewModalBooking.status ? (
                          <span
                            className={`status-badge ${getStatusClass(
                              viewModalBooking.status,
                            )}`}
                          >
                            {getStatusLabel(viewModalBooking.status)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">
                        Preferred Date:
                      </span>
                      <span className="demobook-view-value">
                        {formatPreferredDate(viewModalBooking.preferredDate)}
                      </span>
                    </div>
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">
                        Preferred Time:
                      </span>
                      <span className="demobook-view-value">
                        {formatPreferredTime(viewModalBooking.preferredTime)}
                      </span>
                    </div>
                  </div>
                  <div className="demobook-view-grid demobook-view-grid-3">
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">Timezone:</span>
                      <span className="demobook-view-value">
                        {viewModalBooking.timezone || "-"}
                      </span>
                    </div>
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">Submitted On:</span>
                      <span className="demobook-view-value">
                        {formatDate(viewModalBooking.createdAt)}
                      </span>
                    </div>
                    <div className="demobook-view-row">
                      <span className="demobook-view-label">Last Updated:</span>
                      <span className="demobook-view-value">
                        {formatDate(viewModalBooking.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="demobook-view-row demobook-view-row-message">
                    <span className="demobook-view-label">Notes:</span>
                    <span className="demobook-view-value demobook-view-message">
                      {viewModalBooking.notes || "-"}
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

export default GetDemoBook;