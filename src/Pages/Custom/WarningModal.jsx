import ErrorIcon from '@mui/icons-material/Error';
import "../../Scss/Custom/deletemodal.scss";

const WarningModal = ({ message, onClose }) => {
    return (
        <>
            <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
                <div className="modal-dialog" style={{ maxWidth: "460px", width: "100%" }}>
                    <div className="modal-content">
                        <div
                            className="modal-header"
                            style={{ flexDirection: "column", alignItems: "center" }}
                        >
                            <ErrorIcon
                                style={{ fontSize: "48px", color: "red", marginBottom: "4px" }}
                            />
                            <h5 className="modal-title" style={{ color: "red", margin: 0 }}>
                                Warning
                            </h5>
                        </div>
                        <div className="modal-body text-center">
                            <p style={{ marginBottom: 0 }}>{message}</p>
                        </div>
                        <div className="modal-footer justify-content-center">
                            <button type="button" className="btn btn-primary" onClick={onClose}>
                                Ok, got it
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
};

export default WarningModal;
