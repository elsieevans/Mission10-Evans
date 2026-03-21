namespace BookstoreApi.Models;

// Matches SQLite table "Books" (columns from Mission #11 database).
public class Book
{
    public int BookID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string Classification { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int PageCount { get; set; }
    public decimal Price { get; set; }
}

