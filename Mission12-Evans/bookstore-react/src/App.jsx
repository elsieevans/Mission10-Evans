import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Offcanvas, Toast } from "bootstrap";
import Heading from "./Heading.jsx";
import BookList from "./BookList.jsx";
import "./App.css";

// ---- Copy/paste for Learning Suite (Mission 12 rubric) ----
// Bootstrap extras we used that weren’t in the class videos:
// 1) Offcanvas — sliding “Cart” panel from the right (classes: offcanvas, offcanvas-end, +
//    data-bs-toggle / data-bs-target on the Cart button). See the cart drawer markup below.
// 2) Toast — small popup “Added to cart!” (Toast component from bootstrap JS + toast classes).
// ----------------------------------------------------------

// Same port as bezoz/BookstoreApi (launchSettings.json).
const API_BASE = "http://localhost:5120";

// sessionStorage keys — lasts until you close the browser tab (“session”), perfect for a cart.
const STORAGE_CART = "bookstore_m12_cart";
const STORAGE_CONTINUE = "bookstore_m12_continue";

function readCartFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_CART);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [loading, setLoading] = useState(true);
  const [booksResponse, setBooksResponse] = useState({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 0,
  });

  // Books filters / paging — category is Mission 12’s “filter by category” requirement.
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortByTitle, setSortByTitle] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");
  const [category, setCategory] = useState("");

  const [categories, setCategories] = useState([]);

  // Cart lines: { bookId, title, price, quantity } — price is a number for math.
  const [cart, setCart] = useState(readCartFromStorage);

  // Toast ref — Bootstrap’s JS needs a real DOM node to show the little popup.
  const toastRef = useRef(null);
  const cartOffcanvasEl = useRef(null);

  // One-time fetch of category names for the dropdown (separate API route).
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/books/categories`)
      .then((res) => setCategories(res.data ?? []))
      .catch((err) => {
        console.error("Could not load categories:", err);
        setCategories([]);
      });
  }, []);

  // Whenever cart changes, mirror it to sessionStorage so it survives refresh & navigation.
  useEffect(() => {
    sessionStorage.setItem(STORAGE_CART, JSON.stringify(cart));
  }, [cart]);

  // Fetch the current page whenever filters or paging change.
  useEffect(() => {
    setLoading(true);

    const params = {
      pageNumber,
      pageSize,
      sortByTitle,
      sortDirection,
    };
    if (category) params.category = category;

    axios
      .get(`${API_BASE}/api/books`, { params })
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
  }, [pageNumber, pageSize, sortByTitle, sortDirection, category]);

  const totalPages = booksResponse.totalPages || 0;

  /* Page buttons in the footer: we only show a window of numbers (max 7) around the current page
     so it doesn’t get huge when there are tons of pages. */
  const pagesToShow = useMemo(() => {
    if (totalPages <= 1) return [1].filter((p) => p <= totalPages);
    const maxPages = 7;

    let start = pageNumber - Math.floor(maxPages / 2);
    let end = pageNumber + Math.floor(maxPages / 2);

    start = Math.max(1, start);
    end = Math.min(totalPages, end);

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
    ? "Sort Title (A–Z)"
    : sortDirection === "asc"
      ? "Sort Title (A–Z)"
      : "Sort Title (Z–A)";

  // Remember list position when they add something — “Continue shopping” restores this.
  const snapshotListState = () => {
    sessionStorage.setItem(
      STORAGE_CONTINUE,
      JSON.stringify({
        pageNumber,
        pageSize,
        category,
        sortByTitle,
        sortDirection,
      }),
    );
  };

  const handleAddToCart = (book) => {
    snapshotListState();

    const price = Number(book.price);
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.bookId === book.bookId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { bookId: book.bookId, title: book.title, price, quantity: 1 }];
    });

    if (toastRef.current) Toast.getOrCreateInstance(toastRef.current).show();
  };

  const updateCartQuantity = (bookId, quantity) => {
    const q = Math.max(1, parseInt(quantity, 10) || 1);
    setCart((prev) => prev.map((l) => (l.bookId === bookId ? { ...l, quantity: q } : l)));
  };

  const removeLine = (bookId) => {
    setCart((prev) => prev.filter((l) => l.bookId !== bookId));
  };

  // Subtotal per line and overall total — assignment asks for qty, price, subtotal, total.
  const cartLineSubtotal = (line) => line.price * line.quantity;
  const cartTotal = cart.reduce((sum, line) => sum + cartLineSubtotal(line), 0);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const handleContinueShopping = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_CONTINUE);
      if (raw) {
        const s = JSON.parse(raw);
        setPageNumber(s.pageNumber ?? 1);
        setPageSize(s.pageSize ?? 5);
        setCategory(typeof s.category === "string" ? s.category : "");
        setSortByTitle(!!s.sortByTitle);
        setSortDirection(s.sortDirection === "desc" ? "desc" : "asc");
      }
    } catch {
      /* ignore bad JSON */
    }
    const el = cartOffcanvasEl.current;
    if (el) Offcanvas.getInstance(el)?.hide();
  };

  return (
    <div className="app">
      {/* Bootstrap grid: responsive columns — sidebar filters / summary, main table area */}
      <div className="container py-4">
        <Heading cartCount={cartCount} cartTotal={cartTotal} />

        <div className="row g-4">
          <aside className="col-lg-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h6 card-title">Browse</h2>

                {/* Changing category resets to page 1; API returns new totalPages for that slice */}
                <label className="form-label small text-muted mb-1" htmlFor="categoryFilter">
                  Category
                </label>
                <select
                  id="categoryFilter"
                  className="form-select form-select-sm mb-3"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPageNumber(1);
                  }}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button className="btn btn-outline-primary btn-sm w-100 mb-2" onClick={toggleSortByTitle}>
                  {sortButtonLabel}
                </button>

                <div className="mb-2">
                  <label className="form-label small text-muted mb-1" htmlFor="pageSize">
                    Results per page
                  </label>
                  <select
                    id="pageSize"
                    className="form-select form-select-sm"
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

                <hr />

                {/* Cart summary on the main book list page (Mission 12) */}
                <h2 className="h6">Cart summary</h2>
                <p className="small text-muted mb-2">
                  {cartCount === 0
                    ? "No items yet — add a book from the table."
                    : `${cartCount} item${cartCount === 1 ? "" : "s"} in your cart`}
                </p>
                <p className="fw-semibold mb-2">${cartTotal.toFixed(2)}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm w-100"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#cartOffcanvas"
                >
                  View / edit cart
                </button>
              </div>
            </div>
          </aside>

          <main className="col-lg-9">
            {loading ? (
              <p className="text-muted">Loading books…</p>
            ) : (
              <div className="table-wrap">
                <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                  <div className="text-muted small">
                    Showing page {pageNumber} of {totalPages} ({booksResponse.totalCount} total books
                    {category ? ` in “${category}”` : ""})
                  </div>
                </div>

                <BookList books={booksResponse.items} onAddToCart={handleAddToCart} />

                <nav className="mt-3" aria-label="Pagination">
                  <ul className="pagination mb-0 justify-content-center flex-wrap">
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
          </main>
        </div>
      </div>

      {/* Offcanvas = Bootstrap’s slide-in panel; cart lives here so the table isn’t cluttered */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="cartOffcanvas"
        aria-labelledby="cartOffcanvasLabel"
        ref={cartOffcanvasEl}
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="cartOffcanvasLabel">
            Your cart
          </h2>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          {cart.length === 0 ? (
            <p className="text-muted small">Nothing here yet — close this and add a book.</p>
          ) : (
            <>
              <ul className="list-group list-group-flush flex-grow-1 mb-3">
                {cart.map((line) => (
                  <li key={line.bookId} className="list-group-item px-0">
                    <div className="fw-semibold">{line.title}</div>
                    <div className="small text-muted">${line.price.toFixed(2)} each</div>
                    <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
                      <label className="small mb-0" htmlFor={`qty-${line.bookId}`}>
                        Qty
                      </label>
                      <input
                        id={`qty-${line.bookId}`}
                        type="number"
                        min={1}
                        className="form-control form-control-sm"
                        style={{ width: "5rem" }}
                        value={line.quantity}
                        onChange={(e) => updateCartQuantity(line.bookId, e.target.value)}
                      />
                      <span className="small ms-auto">
                        Subtotal: <strong>${cartLineSubtotal(line).toFixed(2)}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-danger px-0 mt-1"
                      onClick={() => removeLine(line.bookId)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-top pt-3 mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-semibold">Total</span>
                  <span className="fs-5 fw-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <button type="button" className="btn btn-outline-secondary w-100 mb-2" onClick={handleContinueShopping}>
                  Continue shopping
                </button>
                <p className="small text-muted mb-0">
                  “Continue shopping” sends you back to the same category &amp; page you were on when you last added an
                  item.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast lives at the root; Bootstrap fades it in when we call Toast.getOrCreateInstance(...).show() */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
        <div
          id="cartToast"
          ref={toastRef}
          className="toast align-items-center text-bg-success border-0"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">Added to cart!</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
