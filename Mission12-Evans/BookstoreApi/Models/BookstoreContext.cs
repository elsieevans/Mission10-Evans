using Microsoft.EntityFrameworkCore;

namespace BookstoreApi.Models;

// EF Core "context" = your app's connection to the database. DbSet<Book> is the Books table.
public class BookstoreContext : DbContext
{
    public BookstoreContext(DbContextOptions<BookstoreContext> options) : base(options)
    {
    }

    public DbSet<Book> Books => Set<Book>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tell EF how the Book entity lines up with SQLite (table name, keys, required fields).
        modelBuilder.Entity<Book>(entity =>
        {
            entity.ToTable("Books");
            entity.HasKey(e => e.BookID);

            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Author).IsRequired();
            entity.Property(e => e.Publisher).IsRequired();
            entity.Property(e => e.ISBN).IsRequired();
            entity.Property(e => e.Classification).IsRequired();
            entity.Property(e => e.Category).IsRequired();

            // SQLite stores REAL columns, EF will still map to decimal.
            entity.Property(e => e.Price).HasColumnType("REAL");
        });
    }
}

