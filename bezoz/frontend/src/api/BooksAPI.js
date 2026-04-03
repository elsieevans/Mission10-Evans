// Default: Azure-hosted API. For local backend, add `.env.local` with VITE_API_URL=http://localhost:5120 (no trailing slash).
const BOOKS_URL =
  import.meta.env.VITE_API_URL != null && String(import.meta.env.VITE_API_URL).trim() !== ""
    ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, "")}/api/books`
    : "https://bookstoreproject-evans-backend-g9gjahebcwgbbdat.francecentral-01.azurewebsites.net/api/books";

/**
 * @typedef {object} Book
 * @property {number} bookId
 * @property {string} title
 * @property {string} author
 * @property {string} publisher
 * @property {string} isbn
 * @property {string} classification
 * @property {string} category
 * @property {number} pageCount
 * @property {number} price
 */

/**
 * @typedef {object} PagedBooksResponse
 * @property {Book[]} items
 * @property {number} totalCount
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {object} BookWritePayload
 * @property {string} title
 * @property {string} author
 * @property {string} publisher
 * @property {string} isbn
 * @property {string} classification
 * @property {string} category
 * @property {number} pageCount
 * @property {number} price
 */

async function parseErrorMessage(response) {
  const text = await response.text().catch(() => "");
  if (!text) return `Request failed (${response.status})`;
  try {
    const data = JSON.parse(text);
    if (typeof data === "string") return data;
    if (data?.title && typeof data.title === "string") return data.title;
    if (Array.isArray(data?.errors) && data.errors[0]) return String(data.errors[0]);
  } catch {
    /* not JSON */
  }
  return text || `Request failed (${response.status})`;
}

async function jsonFromResponse(response) {
  if (response.status === 204) return null;
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

/**
 * Paged book list (optional category filter, sort, pagination).
 * @param {object} opts
 * @param {number} [opts.pageNumber]
 * @param {number} [opts.pageSize]
 * @param {boolean} [opts.sortByTitle]
 * @param {string} [opts.sortDirection]
 * @param {string} [opts.category]
 * @returns {Promise<PagedBooksResponse>}
 */
export async function fetchBooks({
  pageNumber = 1,
  pageSize = 5,
  sortByTitle = false,
  sortDirection = "asc",
  category = "",
} = {}) {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
    sortByTitle: String(sortByTitle),
    sortDirection,
  });
  if (category) params.set("category", category);

  const response = await fetch(`${BOOKS_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

/**
 * Distinct category names for filters.
 * @returns {Promise<string[]>}
 */
export async function fetchBookCategories() {
  const response = await fetch(`${BOOKS_URL}/categories`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

/**
 * @param {number} id
 * @returns {Promise<Book>}
 */
export async function fetchBookById(id) {
  const response = await fetch(`${BOOKS_URL}/${id}`);
  return jsonFromResponse(response);
}

/**
 * Create a new book (admin).
 * @param {BookWritePayload} book
 * @returns {Promise<Book>}
 */
export async function addBook(book) {
  const response = await fetch(BOOKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  return jsonFromResponse(response);
}

/**
 * @param {number} id
 * @param {BookWritePayload} book
 * @returns {Promise<Book>}
 */
export async function updateBook(id, book) {
  const response = await fetch(`${BOOKS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  return jsonFromResponse(response);
}

/**
 * @param {number} id
 */
export async function deleteBook(id) {
  const response = await fetch(`${BOOKS_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}
