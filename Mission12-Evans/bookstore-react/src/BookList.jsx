/* Table of books from the API. The parent (App) passes `onAddToCart` so each row can send
   that book into the shopping cart. */
function BookList({ books, onAddToCart }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Publisher</th>
            <th>ISBN</th>
            <th>Classification</th>
            <th>Category</th>
            <th>Pages</th>
            <th>Price</th>
            <th scope="col" className="text-end">
              Cart
            </th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center text-muted">
                No books found.
              </td>
            </tr>
          ) : (
            books.map((b) => (
              <tr key={b.bookId}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.publisher}</td>
                <td>{b.isbn}</td>
                <td>{b.classification}</td>
                <td>{b.category}</td>
                <td>{b.pageCount}</td>
                <td>${Number(b.price).toFixed(2)}</td>
                <td className="text-end">
                  <button type="button" className="btn btn-sm btn-outline-success" onClick={() => onAddToCart(b)}>
                    Add
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BookList;
