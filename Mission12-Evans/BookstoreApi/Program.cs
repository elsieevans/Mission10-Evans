using BookstoreApi.Models;
using Microsoft.EntityFrameworkCore;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Register services: controllers (your API classes) + EF Core DB context.
builder.Services.AddControllers();
builder.Services.AddDbContext<BookstoreContext>(options =>
{
    // Point SQLite at Bookstore.sqlite next to the solution so paths work from any cwd.
    var dbPath = Path.GetFullPath(
        Path.Combine(builder.Environment.ContentRootPath, "..", "Bookstore.sqlite"));

    var connectionString = builder.Configuration.GetConnectionString("BookstoreConnection")
        ?? $"Data Source={dbPath}";

    options.UseSqlite(connectionString.Replace("../Bookstore.sqlite", dbPath));
});

// CORS lets the React dev server (localhost:5173) call this API without the browser blocking it.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.MapControllers();
app.Run();
