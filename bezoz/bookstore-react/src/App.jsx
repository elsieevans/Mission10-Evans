import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Heading from "./Heading.jsx";
import BookList from "./BookList.jsx";
import "./App.css";

// Must match BookstoreApi launch URL (see bezoz/BookstoreApi/Properties/launchSettings.json).
const API_BASE = "http://localhost:5120";

function App() {
  const [loading, setLoading] = useState(true);
  const [booksResponse, setBooksResponse] = useState({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 0,
  });

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortByTitle, setSortByTitle] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${API_BASE}/api/books`, {
        params: {
          pageNumber,
          pageSize,
          sortByTitle,
          sortDirection,
        },
      })
      .then((response) => {
        setBooksResponse(response.data);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setBooksResponse({
          items: [],
          totalCount: 0,
          pageNumber,
          pageSize,
          totalPages: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [pageNumber, pageSize, sortByTitle, sortDirection]);

  const totalPages = booksResponse.totalPages || 0;

  // Page numbers for Bootstrap pagination: built from API totalPages (dynamic, not hard-coded).
  const pagesToShow = useMemo(() => {
    if (totalPages <= 1) return [1].filter((p) => p <= totalPages);
    const maxPages = 7;

    let start = pageNumber - Math.floor(maxPages / 2);
    let end = pageNumber + Math.floor(maxPages / 2);

    start = Math.max(1, start);
    end = Math.min(totalPages, end);

    // shift window if we're near either edge
    const windowSize = end - start + 1;
    if (windowSize < maxPages) {
      const shift = maxPages - windowSize;
      start = Math.max(1, start - shift);
    }

    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [pageNumber, totalPages]);

  const toggleSortByTitle = () => {
    if (!sortByTitle) {
      setSortByTitle(true);
      setSortDirection("asc");
      setPageNumber(1);
      return;
    }

    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    setPageNumber(1);
  };

  const sortButtonLabel = !sortByTitle
    ? "Sort Title (A-Z)"
    : sortDirection === "asc"
      ? "Sort Title (A-Z)"
      : "Sort Title (Z-A)";

  return (
    <div className="app">
      <Heading />

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="btn btn-outline-primary btn-sm" onClick={toggleSortByTitle}>
          {sortButtonLabel}
        </button>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Results per page:</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 120 }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPageNumber(1);
            }}
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading books...</p>
      ) : (
        <div className="table-wrap">
          <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
            <div className="text-muted small">
              Showing page {pageNumber} of {totalPages} ({booksResponse.totalCount} total books)
            </div>
          </div>

          <BookList books={booksResponse.items} />

          <nav className="mt-3" aria-label="Pagination">
            <ul className="pagination mb-0 justify-content-center">
              <li className={`page-item ${pageNumber <= 1 ? "disabled" : ""}`}>
                <a
                  className="page-link"
                  href="#"
                  aria-disabled={pageNumber <= 1}
                  onClick={(e) => {
                    e.preventDefault();
                    if (pageNumber > 1) setPageNumber(1);
                  }}
                >
                  First
                </a>
              </li>

              <li className={`page-item ${pageNumber <= 1 ? "disabled" : ""}`}>
                <a
                  className="page-link"
                  href="#"
                  aria-disabled={pageNumber <= 1}
                  onClick={(e) => {
                    e.preventDefault();
                    if (pageNumber > 1) setPageNumber((p) => Math.max(1, p - 1));
                  }}
                >
                  Prev
                </a>
              </li>

              {pagesToShow.map((p) => (
                <li key={p} className={`page-item ${p === pageNumber ? "active" : ""}`}>
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPageNumber(p);
                    }}
                  >
                    {p}
                  </a>
                </li>
              ))}

              <li className={`page-item ${pageNumber >= totalPages ? "disabled" : ""}`}>
                <a
                  className="page-link"
                  href="#"
                  aria-disabled={pageNumber >= totalPages}
                  onClick={(e) => {
                    e.preventDefault();
                    if (pageNumber < totalPages) setPageNumber((p) => Math.min(totalPages, p + 1));
                  }}
                >
                  Next
                </a>
              </li>

              <li className={`page-item ${pageNumber >= totalPages ? "disabled" : ""}`}>
                <a
                  className="page-link"
                  href="#"
                  aria-disabled={pageNumber >= totalPages}
                  onClick={(e) => {
                    e.preventDefault();
                    if (pageNumber < totalPages && totalPages > 0) setPageNumber(totalPages);
                  }}
                >
                  Last
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default App;

