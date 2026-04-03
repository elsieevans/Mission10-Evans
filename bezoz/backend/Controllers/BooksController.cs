using BookstoreApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookstoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    public record BookDto(
        int bookId,
        string title,
        string author,
        string publisher,
        string isbn,
        string classification,
        string category,
        int pageCount,
        decimal price
    );

    public record BookWriteDto(
        string Title,
        string Author,
        string Publisher,
        string ISBN,
        string Classification,
        string Category,
        int PageCount,
        decimal Price
    );

    public record PagedBooksResponse(
        List<BookDto> items,
        int totalCount,
        int pageNumber,
        int pageSize,
        int totalPages
    );

    private static BookDto ToDto(Book b) => new(
        b.BookID,
        b.Title,
        b.Author,
        b.Publisher,
        b.ISBN,
        b.Classification,
        b.Category,
        b.PageCount,
        b.Price
    );

    // Mission 12: the React dropdown needs every distinct category (Biography, Self-Help, …).
    // Small separate route so we don’t have to download every book just to build the filter list.
    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetCategories()
    {
        var categories = await _context.Books.AsNoTracking()
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookDto>> GetBookById(int id)
    {
        var book = await _context.Books.AsNoTracking().FirstOrDefaultAsync(b => b.BookID == id);
        if (book is null) return NotFound();
        return Ok(ToDto(book));
    }

    // Paged list for the React app: totalCount/totalPages drive pagination. When ?category=... is sent,
    // we only count/sort/page books in that category so the page numbers match what the user sees.
    [HttpGet]
    public async Task<ActionResult<PagedBooksResponse>> GetBooks(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] bool sortByTitle = false,
        [FromQuery] string sortDirection = "asc",
        [FromQuery] string? category = null)
    {
        pageNumber = pageNumber < 1 ? 1 : pageNumber;
        pageSize = pageSize < 1 ? 5 : pageSize;

        // Start with all books; we'll optionally narrow by category next.
        var query = _context.Books.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(b => b.Category == category);

        // Total rows AFTER the filter — this is what makes "page X of Y" correct per category.
        var totalCount = await query.CountAsync();

        query = sortByTitle
            ? (sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase)
                ? query.OrderByDescending(b => b.Title)
                : query.OrderBy(b => b.Title))
            : query.OrderBy(b => b.BookID);

        var skip = (pageNumber - 1) * pageSize;
        var items = await query
            .Skip(skip)
            .Take(pageSize)
            .Select(b => new BookDto(
                b.BookID,
                b.Title,
                b.Author,
                b.Publisher,
                b.ISBN,
                b.Classification,
                b.Category,
                b.PageCount,
                b.Price
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return Ok(new PagedBooksResponse(items, totalCount, pageNumber, pageSize, totalPages));
    }

    [HttpPost]
    public async Task<ActionResult<BookDto>> CreateBook([FromBody] BookWriteDto body)
    {
        var err = ValidateWrite(body);
        if (err is not null) return BadRequest(err);

        var book = new Book
        {
            Title = body.Title.Trim(),
            Author = body.Author.Trim(),
            Publisher = body.Publisher.Trim(),
            ISBN = body.ISBN.Trim(),
            Classification = body.Classification.Trim(),
            Category = body.Category.Trim(),
            PageCount = body.PageCount,
            Price = body.Price,
        };

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBookById), new { id = book.BookID }, ToDto(book));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BookDto>> UpdateBook(int id, [FromBody] BookWriteDto body)
    {
        var err = ValidateWrite(body);
        if (err is not null) return BadRequest(err);

        var book = await _context.Books.FirstOrDefaultAsync(b => b.BookID == id);
        if (book is null) return NotFound();

        book.Title = body.Title.Trim();
        book.Author = body.Author.Trim();
        book.Publisher = body.Publisher.Trim();
        book.ISBN = body.ISBN.Trim();
        book.Classification = body.Classification.Trim();
        book.Category = body.Category.Trim();
        book.PageCount = body.PageCount;
        book.Price = body.Price;

        await _context.SaveChangesAsync();
        return Ok(ToDto(book));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.BookID == id);
        if (book is null) return NotFound();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static string? ValidateWrite(BookWriteDto body)
    {
        if (string.IsNullOrWhiteSpace(body.Title)) return "Title is required.";
        if (string.IsNullOrWhiteSpace(body.Author)) return "Author is required.";
        if (string.IsNullOrWhiteSpace(body.Publisher)) return "Publisher is required.";
        if (string.IsNullOrWhiteSpace(body.ISBN)) return "ISBN is required.";
        if (string.IsNullOrWhiteSpace(body.Classification)) return "Classification is required.";
        if (string.IsNullOrWhiteSpace(body.Category)) return "Category is required.";
        if (body.PageCount < 0) return "Page count cannot be negative.";
        if (body.Price < 0) return "Price cannot be negative.";
        return null;
    }
}
