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

    // Paged list for the React app: totalCount/totalPages drive dynamic pagination on the client.
    [HttpGet]
    public async Task<ActionResult<PagedBooksResponse>> GetBooks(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] bool sortByTitle = false,
        [FromQuery] string sortDirection = "asc")
    {
        pageNumber = pageNumber < 1 ? 1 : pageNumber;
        pageSize = pageSize < 1 ? 5 : pageSize;

        var query = _context.Books.AsNoTracking();

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

