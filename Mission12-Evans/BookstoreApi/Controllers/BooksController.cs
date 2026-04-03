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

    public record PagedBooksResponse(
        List<BookDto> items,
        int totalCount,
        int pageNumber,
        int pageSize,
        int totalPages
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
}

