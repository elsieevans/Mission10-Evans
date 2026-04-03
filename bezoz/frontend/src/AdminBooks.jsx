import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addBook, deleteBook, fetchBooks, updateBook } from "./api/BooksAPI.js";

const emptyForm = {
  title: "",
  author: "",
  publisher: "",
  isbn: "",
  classification: "",
  category: "",
  pageCount: "",
  price: "",
};

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadBooks = useCallback(() => {
    setLoading(true);
    fetchBooks({ pageNumber: 1, pageSize: 500 })
      .then((res) => setBooks(res.items ?? []))
      .catch(() => {
        setBooks([]);
        setMessage({ type: "danger", text: "Could not load books. Is the API running?" });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      publisher: form.publisher.trim(),
      isbn: form.isbn.trim(),
      classification: form.classification.trim(),
      category: form.category.trim(),
      pageCount: parseInt(form.pageCount, 10) || 0,
      price: parseFloat(form.price) || 0,
    };
    try {
      if (editingId != null) {
        await updateBook(editingId, payload);
        setMessage({ type: "success", text: "Book updated." });
      } else {
        await addBook(payload);
        setMessage({ type: "success", text: "Book added." });
      }
      setForm(emptyForm);
      setEditingId(null);
      loadBooks();
    } catch (err) {
      const text = err instanceof Error && err.message ? err.message : "Save failed.";
      setMessage({ type: "danger", text });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b.bookId);
    setForm({
      title: b.title,
      author: b.author,
      publisher: b.publisher,
      isbn: b.isbn,
      classification: b.classification,
      category: b.category,
      pageCount: String(b.pageCount ?? ""),
      price: String(b.price ?? ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this book permanently?")) return;
    try {
      await deleteBook(id);
      setMessage({ type: "success", text: "Book deleted." });
      if (editingId === id) cancelEdit();
      loadBooks();
    } catch {
      setMessage({ type: "danger", text: "Delete failed." });
    }
  };

  return (
    <div className="app">
      <div className="container py-4">
        <div className="mb-3">
          <Link to="/" className="link-secondary small">
            ← Back to bookstore
          </Link>
        </div>
        <header className="mb-4">
          <h1 className="h3 mb-1">Admin — manage books</h1>
          <p className="text-muted mb-0 small">Add, edit, or remove books in the database.</p>
        </header>

        {message && (
          <div className={`alert alert-${message.type} py-2`} role="alert">
            {message.text}
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 card-title">{editingId == null ? "Add a book" : `Editing book #${editingId}`}</h2>
            <form onSubmit={onSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label small" htmlFor="ab-title">
                  Title
                </label>
                <input
                  id="ab-title"
                  className="form-control form-control-sm"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small" htmlFor="ab-author">
                  Author
                </label>
                <input
                  id="ab-author"
                  className="form-control form-control-sm"
                  value={form.author}
                  onChange={(e) => setField("author", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small" htmlFor="ab-publisher">
                  Publisher
                </label>
                <input
                  id="ab-publisher"
                  className="form-control form-control-sm"
                  value={form.publisher}
                  onChange={(e) => setField("publisher", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small" htmlFor="ab-isbn">
                  ISBN
                </label>
                <input
                  id="ab-isbn"
                  className="form-control form-control-sm"
                  value={form.isbn}
                  onChange={(e) => setField("isbn", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small" htmlFor="ab-classification">
                  Classification
                </label>
                <input
                  id="ab-classification"
                  className="form-control form-control-sm"
                  value={form.classification}
                  onChange={(e) => setField("classification", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small" htmlFor="ab-category">
                  Category
                </label>
                <input
                  id="ab-category"
                  className="form-control form-control-sm"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small" htmlFor="ab-pages">
                  Page count
                </label>
                <input
                  id="ab-pages"
                  type="number"
                  min={0}
                  className="form-control form-control-sm"
                  value={form.pageCount}
                  onChange={(e) => setField("pageCount", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small" htmlFor="ab-price">
                  Price
                </label>
                <input
                  id="ab-price"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control form-control-sm"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  required
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? "Saving…" : editingId != null ? "Update book" : "Add book"}
                </button>
                {editingId != null && (
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelEdit}>
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      No books found.
                    </td>
                  </tr>
                ) : (
                  books.map((b) => (
                    <tr key={b.bookId}>
                      <td>{b.bookId}</td>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.category}</td>
                      <td className="text-end">${Number(b.price).toFixed(2)}</td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(b)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(b.bookId)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBooks;
