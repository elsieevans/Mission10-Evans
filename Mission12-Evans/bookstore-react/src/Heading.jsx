/* Top banner for the page. Shows a little badge with how many things are in the cart so it’s always visible. */
function Heading({ cartCount = 0, cartTotal = 0 }) {
  return (
    <header className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">Online Bookstore</h1>
        <p className="text-muted mb-0">Browse books, filter by category, and build a cart (saved for this browser tab).</p>
      </div>
      <div className="text-end">
        <span className="text-muted small d-block">In cart</span>
        <span className="badge text-bg-secondary rounded-pill fs-6">{cartCount}</span>
        <div className="small text-muted mt-1">${Number(cartTotal).toFixed(2)}</div>
      </div>
    </header>
  );
}

export default Heading;
