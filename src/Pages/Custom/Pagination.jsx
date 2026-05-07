import "../../Scss/Custom/pagination.scss";

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    pageSizeOptions,
    selectedPageSize,
    onPageSizeChange,
    totalRecords,
}) => {
    const maxPagesToShow = 3;
    let startPage;
    let endPage;

    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else if (currentPage === 1) {
        startPage = 1;
        endPage = maxPagesToShow;
    } else if (currentPage === totalPages) {
        startPage = totalPages - (maxPagesToShow - 1);
        endPage = totalPages;
    } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i += 1) {
        pageNumbers.push(i);
    }

    const startRecord =
        totalRecords === 0 ? 0 : (currentPage - 1) * selectedPageSize + 1;
    const endRecord =
        totalRecords === 0
            ? 0
            : Math.min(currentPage * selectedPageSize, totalRecords);

    return (
        <div className="d-flex justify-content-between align-items-center paginationdiv">
            <div className="page-size-dropdown">
                <select
                    id="pageSize"
                    className="form-select"
                    value={selectedPageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>

            <div className="records-info">
                Showing {startRecord} to {endRecord} of {totalRecords} entries
            </div>

            <nav aria-label="Page navigation">
                <ul className="pagination justify-content-end">
                    <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                        <button
                            type="button"
                            className="page-link"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                    </li>
                    {pageNumbers.map((number) => (
                        <li
                            key={number}
                            className={`page-item ${currentPage === number ? "active" : ""}`}
                        >
                            <button
                                type="button"
                                className="page-link"
                                onClick={() => onPageChange(number)}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                    <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                        <button
                            type="button"
                            className="page-link"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Pagination;
